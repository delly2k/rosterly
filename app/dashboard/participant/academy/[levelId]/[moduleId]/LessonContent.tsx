const LESSON_CONTENT_STYLES = `
  .lesson-content h3 {
    font-size: 17px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 28px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #C8973A;
    display: inline-block;
  }
  .lesson-content h3:first-child { margin-top: 0; }
  .lesson-content p {
    font-size: 14px;
    line-height: 1.85;
    color: #3A3A3A;
    margin: 0 0 16px;
  }
  .lesson-content ul {
    margin: 0 0 18px 0;
    padding-left: 0;
    list-style: none;
  }
  .lesson-content ol {
    margin: 0 0 18px 0;
    padding-left: 20px;
  }
  .lesson-content ul li {
    font-size: 14px;
    line-height: 1.8;
    color: #3A3A3A;
    padding: 6px 0 6px 28px;
    position: relative;
    border-bottom: 0.5px solid #F0EEE8;
  }
  .lesson-content ul li:last-child { border-bottom: none; }
  .lesson-content ul li::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #C8973A;
  }
  .lesson-content ol li {
    font-size: 14px;
    line-height: 1.8;
    color: #3A3A3A;
    margin-bottom: 8px;
    padding-left: 6px;
  }
  .lesson-content strong {
    font-weight: 700;
    color: #1A1A1A;
  }
  .lesson-content em {
    font-style: italic;
    color: #555;
  }
  .lesson-content blockquote {
    margin: 20px 0;
    padding: 16px 20px;
    border-left: 4px solid #C8973A;
    background: #FBF7EF;
    border-radius: 0 10px 10px 0;
    font-size: 15px;
    font-style: italic;
    color: #5A4A2A;
    line-height: 1.7;
  }
  .lesson-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 20px;
    font-size: 13px;
    border-radius: 8px;
    overflow: hidden;
    border: 0.5px solid #E5E3DC;
  }
  .lesson-content td {
    padding: 10px 14px;
    border: 0.5px solid #E5E3DC;
    color: #3A3A3A;
    line-height: 1.6;
  }
  .lesson-content tr:first-child td { background: #FBF7EF; font-weight: 600; }
  .lesson-content tr:nth-child(even) td { background: #FAFAF8; }
  .lesson-content td strong { color: #C8973A; }
`;

export function LessonContent({ html }: { html: string }) {
  return (
    <>
      <style>{LESSON_CONTENT_STYLES}</style>
      <div
        className="lesson-content lesson-content-wrapper"
        style={{
          background: "white",
          borderRadius: 12,
          border: "0.5px solid var(--color-border)",
          padding: "32px 36px",
          marginBottom: 24,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
