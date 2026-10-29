import { getEducation, getExperience } from "@/lib/content/profile";
import { formatPeriod } from "@/lib/format";

// Field (work) first, then Origin (education), as on the journey map.
export default function ExperiencePage() {
  const experience = getExperience();
  const education = getEducation();

  return (
    <div className="flex flex-col gap-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Experience
      </h1>

      <section aria-labelledby="field-title" className="flex flex-col gap-6">
        <h2 id="field-title" className="font-display text-2xl font-semibold">
          Field
        </h2>
        <ol className="flex flex-col gap-6">
          {experience.map((item) => (
            <li
              key={`${item.organization}-${item.period.start}`}
              className="rounded-lg border border-ink/10 bg-surface-raised p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">
                  {item.role} · {item.organization}
                </h3>
                <p className="font-mono text-sm text-muted">
                  {formatPeriod(item.period)}
                </p>
              </div>
              {item.location && (
                <p className="mt-1 text-sm text-muted">{item.location}</p>
              )}
              <ul className="mt-4 list-disc space-y-2 pl-6">
                {item.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="origin-title" className="flex flex-col gap-6">
        <h2 id="origin-title" className="font-display text-2xl font-semibold">
          Origin
        </h2>
        <ol className="flex flex-col gap-6">
          {education.map((item) => (
            <li
              key={`${item.institution}-${item.period.start}`}
              className="rounded-lg border border-ink/10 bg-surface-raised p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">
                  {item.degree} · {item.institution}
                </h3>
                <p className="font-mono text-sm text-muted">
                  {formatPeriod(item.period)}
                </p>
              </div>
              {item.details && (
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
