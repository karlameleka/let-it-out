/** Races a promise against a timeout so a stuck operation surfaces as a
 * real, catchable error instead of hanging the UI forever. Used around
 * client-side PDF generation (dynamic-imported jsPDF/html2canvas +
 * off-screen DOM rasterization), which has been reported to silently
 * stall indefinitely in some mobile WebView contexts — this turns that
 * into an observable failure so the person sees an error instead of a
 * spinner that never resolves. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message = "Timed out"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
