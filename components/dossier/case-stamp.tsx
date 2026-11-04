/** The case number as the dossier's visual identity (accent outline). */
export function CaseStamp({
  caseNumber,
  size = "sm",
}: {
  caseNumber: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-accent/40 bg-accent/10 font-mono font-medium text-accent ${size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
    >
      {caseNumber}
    </span>
  );
}
