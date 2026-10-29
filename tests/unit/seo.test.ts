// @vitest-environment node
import { describe, expect, it } from "vitest";
import { jsonLdScript, pageMetadata, personJsonLd } from "@/lib/seo";

describe("jsonLdScript", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const out = jsonLdScript({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });

  it("serializes the Person schema", () => {
    expect(JSON.parse(jsonLdScript(personJsonLd))).toMatchObject({
      "@type": "Person",
      name: "Arham Zahid Khan",
    });
  });
});

describe("pageMetadata", () => {
  it("sets canonical, Open Graph and Twitter tags", () => {
    const meta = pageMetadata({
      title: "Work",
      description: "Dossiers.",
      path: "/projects",
    });
    expect(meta.title).toBe("Work");
    expect(meta.alternates?.canonical).toBe("/projects");
    expect(meta.openGraph).toMatchObject({
      title: "Work · Arham Zahid Khan",
      url: "/projects",
    });
    expect(meta.robots).toBeUndefined();
  });

  it("marks pages noindex on request", () => {
    const meta = pageMetadata({
      description: "x",
      path: "/lab",
      noIndex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});
