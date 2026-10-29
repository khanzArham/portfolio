/** The case number as the dossier's visual identity (accent fill). */
export function CaseStamp({
  caseNumber,
  size = "sm",
}: {
  caseNumber: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm bg-accent font-mono font-medium text-on-accent ${size === "lg" ? "px-3 py-1 text-base" : "px-2 py-0.5 text-xs"}`}
    >
      {caseNumber}
    </span>
  );
}
