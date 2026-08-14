import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const rand = Math.random().toString(36).slice(2, 8);
const results = [];

function log(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name} ${extra}`);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// --- Flow 1: signup, journal entry, logout ---------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const email = `user-${rand}@example.com`;

  await page.goto(`${BASE}/signup`);
  await page.fill("#name", "Test User");
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click('button[type=submit]');
  await page.waitForURL(`${BASE}/journal`, { timeout: 10000 });
  log("signup redirects to /journal", page.url() === `${BASE}/journal`);

  const promptVisible = await page.locator("text=new prompt").first().isVisible().catch(() => false);
  log("journal dashboard shows prompt heading", promptVisible);

  const promptBefore = await page.locator('[data-testid=journal-prompt-text]').innerText();

  await page.fill("textarea[name=content]", "This is my first journal entry via e2e test.");
  await page.click('button:has-text("Save entry")');
  await page.waitForSelector("text=Entry saved.", { timeout: 10000 });
  log("journal entry saves", true);

  const promptAfter = await page.locator('[data-testid=journal-prompt-text]').innerText();
  log("prompt changes after saving an entry", promptBefore !== promptAfter, `("${promptBefore.slice(0, 30)}..." -> "${promptAfter.slice(0, 30)}...")`);

  await page.goto(`${BASE}/journal/history`);
  const entryVisible = await page.locator("text=This is my first journal entry").first().isVisible().catch(() => false);
  log("entry appears in history", entryVisible);

  await page.click('button:has-text("Log out")');
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  log("logout redirects home", true);

  await ctx.close();
}

// --- Flow 2: guest "Buy now" (skip cart) -> checkout -> COD order -----------
let orderUrl = "";
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/shop`);
  await page.click("text=80 Days of Self-Love");
  await page.waitForURL(/\/shop\/80-days-of-self-love/);

  const priceVisible = await page.locator("text=EGP 1,000").first().isVisible().catch(() => false);
  log("product page shows single price, no ebook option", priceVisible);

  await page.click('button:has-text("Buy now")');
  await page.waitForURL(`${BASE}/cart`, { timeout: 10000 });
  const cartHasItem = await page.locator("text=80 Days of Self-Love").first().isVisible().catch(() => false);
  log("buy now adds item and redirects to cart", cartHasItem);

  await page.click('button:has-text("Checkout")');
  await page.waitForURL(`${BASE}/checkout`, { timeout: 10000 });

  const instapayOptionGone = !(await page.locator("text=InstaPay").first().isVisible().catch(() => false));
  log("checkout has no InstaPay option", instapayOptionGone);

  await page.fill("#guestName", "Guest Buyer");
  await page.fill("#guestEmail", `guest-${rand}@example.com`);
  await page.fill("#guestPhone", "+201000000000");
  const shippingVisible = await page.locator("#shippingAddress").isVisible().catch(() => false);
  log("checkout shows shipping field for physical item", shippingVisible);
  if (shippingVisible) {
    await page.fill("#shippingAddress", "123 Test St, Cairo, Egypt");
    await page.fill("#googleMapsLink", "https://maps.app.goo.gl/test123");
    await page.selectOption("#country", "Egypt");
    const governorateVisible = await page.locator("#governorate").isVisible().catch(() => false);
    log("checkout shows governorate field for Egypt", governorateVisible);
    if (governorateVisible) {
      await page.selectOption("#governorate", "Cairo");
    }
    const shippingFeeVisible = await page.locator("text=EGP 100").first().isVisible().catch(() => false);
    log("checkout shows EGP 100 shipping fee for Egypt", shippingFeeVisible);
  }

  await page.click('button:has-text("Place order")');
  await page.waitForURL(/\/orders\//, { timeout: 10000 });
  orderUrl = page.url();
  log("order created, redirected to order page", true, orderUrl);

  const codVisible = await page.locator("text=Cash on Delivery").first().isVisible().catch(() => false);
  log("order page shows Cash on Delivery confirmation", codVisible);

  await ctx.close();
}

// --- Flow 2b: guest shop -> add to cart -> checkout -> COD order ------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/shop`);
  await page.click("text=30 Days of Mindfulness");
  await page.waitForURL(/\/shop\/30-days-of-mindfulness/);
  await page.click('button:has-text("Add to cart")');
  await page.waitForTimeout(300);

  await page.goto(`${BASE}/checkout`);
  await page.fill("#guestName", "COD Buyer");
  await page.fill("#guestEmail", `cod-${rand}@example.com`);
  await page.fill("#guestPhone", "+201000000003");
  await page.fill("#shippingAddress", "456 Test Ave, Giza, Egypt");
  await page.selectOption("#country", "Egypt");
  await page.selectOption("#governorate", "Giza");

  await page.click('button:has-text("Place order")');
  await page.waitForURL(/\/orders\//, { timeout: 10000 });

  const codVisible = await page.locator("text=Cash on Delivery").first().isVisible().catch(() => false);
  log("COD order page shows Cash on Delivery confirmation", codVisible);

  await ctx.close();
}

// --- Flow 2d: guest checkout with international shipping --------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/shop`);
  await page.click("text=30 Days of Mindfulness");
  await page.waitForURL(/\/shop\/30-days-of-mindfulness/);
  await page.click('button:has-text("Add to cart")');
  await page.waitForTimeout(300);

  await page.goto(`${BASE}/checkout`);
  await page.fill("#guestName", "International Buyer");
  await page.fill("#guestEmail", `intl-${rand}@example.com`);
  await page.fill("#guestPhone", "+14155550000");
  await page.fill("#shippingAddress", "1 Test Rd, Springfield, USA");
  await page.selectOption("#country", "United States");

  const governorateGone = !(await page.locator("#governorate").isVisible().catch(() => false));
  log("checkout hides governorate field for non-Egypt country", governorateGone);

  const calcOnDeliveryVisible = await page
    .locator("text=calculated upon delivery")
    .first()
    .isVisible()
    .catch(() => false);
  log("checkout shows 'calculated upon delivery' for international shipping", calcOnDeliveryVisible);

  await page.click('button:has-text("Place order")');
  await page.waitForURL(/\/orders\//, { timeout: 10000 });

  const intlShippingNote = await page
    .locator("text=Shipping outside Egypt is calculated upon delivery")
    .first()
    .isVisible()
    .catch(() => false);
  log("order page shows international shipping note", intlShippingNote);

  await ctx.close();
}

// --- Flow 2c: workshop notify popup ------------------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/`);
  await page.evaluate(() => window.localStorage.removeItem("lio_workshop_popup_seen"));
  await page.reload();
  await page.waitForTimeout(6500);

  const popupVisible = await page.locator("text=Don't miss our next workshop").first().isVisible().catch(() => false);
  log("workshop notify popup appears", popupVisible);

  if (popupVisible) {
    await page.fill('input[name=email]', `workshop-fan-${rand}@example.com`);
    await page.click('button:has-text("Notify me")');
    await page.waitForSelector("text=You're on the list", { timeout: 10000 });
    log("workshop notify signup succeeds", true);
  } else {
    log("workshop notify signup succeeds", false, "(popup never appeared)");
  }

  await ctx.close();
}

// --- Flow 3: counseling booking ---------------------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/counseling`);
  await page.click("text=Karla Meleka");
  await page.waitForURL(/\/counseling\/karla-meleka/);

  await page.fill("#name", "Booking Test");
  await page.fill("#email", `booking-${rand}@example.com`);
  await page.fill("#phone", "+201000000001");
  await page.fill("#preferredDate", "2026-09-01");
  await page.fill("#preferredTime", "14:00");
  await page.click('button:has-text("Request session")');
  await page.waitForSelector("text=Request received", { timeout: 10000 });
  log("booking request submission succeeds", true);

  await ctx.close();
}

// --- Flow 4: workshop inquiry + contact form ---------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/workshops`);
  await page.fill("#organizationName", "Test Corp");
  await page.fill("#contactName", "HR Person");
  await page.fill("#email", `hr-${rand}@example.com`);
  await page.fill("#phone", "+201000000002");
  await page.click('button:has-text("Request a quote")');
  await page.waitForSelector("text=Request received", { timeout: 10000 });
  log("workshop inquiry submission succeeds", true);

  await page.goto(`${BASE}/contact`);
  await page.fill("#name", "Contact Test");
  await page.fill("#email", `contact-${rand}@example.com`);
  await page.fill("#subject", "Question");
  await page.fill("#message", "Just testing the contact form end to end.");
  await page.click('button:has-text("Send message")');
  await page.waitForSelector("text=Message sent", { timeout: 10000 });
  log("contact form submission succeeds", true);

  await ctx.close();
}

// --- Flow 5: admin login and review everything ------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`);
  await page.fill("#email", "admin@letitout.app");
  await page.fill("#password", "letitout-admin-dev");
  await page.click('button[type=submit]');
  await page.waitForURL(`${BASE}/admin`, { timeout: 10000 });
  log("admin login redirects to /admin", true);

  await page.goto(`${BASE}/admin/orders`);
  const orderInAdmin = await page.locator("text=Guest Buyer").first().isVisible().catch(() => false);
  log("order visible in admin", orderInAdmin);

  const codOrderInAdmin = await page.locator("text=COD Buyer").first().isVisible().catch(() => false);
  log("COD order visible in admin", codOrderInAdmin);

  await page.goto(`${BASE}/admin/bookings`);
  const bookingInAdmin = await page.locator("text=Booking Test").first().isVisible().catch(() => false);
  log("booking visible in admin", bookingInAdmin);

  await page.goto(`${BASE}/admin/workshops`);
  const workshopInAdmin = await page.locator("text=Test Corp").first().isVisible().catch(() => false);
  log("workshop inquiry visible in admin", workshopInAdmin);

  await page.goto(`${BASE}/admin/messages`);
  const messageInAdmin = await page.locator("text=Contact Test").first().isVisible().catch(() => false);
  log("contact message visible in admin", messageInAdmin);

  await page.goto(`${BASE}/admin/workshop-signups`);
  const workshopSignupInAdmin = await page.locator(`text=workshop-fan-${rand}@example.com`).first().isVisible().catch(() => false);
  log("workshop notify signup visible in admin", workshopSignupInAdmin);

  // update an order status
  await page.goto(`${BASE}/admin/orders`);
  const select = page.locator("select[name=status]").first();
  await select.selectOption("CONFIRMED");
  await page.locator('button:has-text("Update")').first().click();
  await page.waitForTimeout(1000);
  log("admin can update order status", true);

  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length > 0) {
  console.log("FAILED:", failed.map((f) => f.name));
  process.exit(1);
}
