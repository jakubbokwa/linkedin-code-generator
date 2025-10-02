import { prisma } from "../../../lib/prisma";
import CopyButton from "../../components/CopyButton";
import ShareToLinkedIn from "../../components/ShareToLinkedin";

export default async function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const rec = await prisma.session.findUnique({ where: { id: params.id } });
  if (!rec) {
    return (
      <main className="lj-container">
        <h1 className="lj-h1">Seite nicht gefunden</h1>
        <p>Der Link existiert nicht (oder wurde entfernt).</p>
      </main>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/s/${params.id}`;

  return (
    <main className="lj-container">
      <h1 className="lj-h1">
        Dein LinkedIn-Post <span className="lj-slash">/</span>
      </h1>

      {rec.photoData && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rec.photoData}
          alt="Foto"
          className="lj-img"
          style={{ marginBottom: 16 }}
        />
      )}

      <section className="lj-section">
        <div className="lj-label">Basis-Prompt</div>
        <textarea
          className="lj-textarea lj-readonly"
          readOnly
          rows={5}
          defaultValue={rec.basePrompt}
        />
      </section>

      <section className="lj-section">
        <div className="lj-label">Ausgewählter Text</div>
        <textarea
          className="lj-textarea"
          readOnly
          rows={8}
          defaultValue={rec.chosenPost}
        />
      </section>

      <div className="lj-row">
        <CopyButton text={rec.chosenPost} />
        <ShareToLinkedIn url={canonicalUrl} />
      </div>
    </main>
  );
}
