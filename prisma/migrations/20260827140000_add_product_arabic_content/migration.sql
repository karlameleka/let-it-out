-- Products were missing Arabic translations entirely (titleAr/descriptionAr
-- both null), so the shop kept showing English descriptions in Arabic mode.
-- Seed data alone never reaches production, so this has to happen here (see
-- CLAUDE.md).
UPDATE "Product" SET
  "titleAr" = '80 يوم من حب الذات',
  "descriptionAr" = 'يومية إرشادية لمدة 80 يوم مصممة عشان تساعدك تعيد بناء علاقتك بنفسك — محاور يومية مبنية على الرأفة الذاتية، والحدود الشخصية، والتأمل الواعي.'
WHERE "slug" = '80-days-of-self-love';

UPDATE "Product" SET
  "titleAr" = '30 يوم من اليقظة الذهنية',
  "descriptionAr" = 'يومية إرشادية لمدة 30 يوم مصممة عشان ترجعك للحظة الحاضرة من خلال محاور يومية قصيرة لليقظة الذهنية، وتمارين تأريض، وتأمل ذاتي هادئ.'
WHERE "slug" = '30-days-of-mindfulness';
