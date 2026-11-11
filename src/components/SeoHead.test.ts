import { describe, expect, it } from "vitest";
import { render } from "../entry-server";
import {
  generateEntityGraphSchema,
  generateLocalBusinessSchema,
  generateServiceSchema,
} from "./SeoHead";

function extractMainText(html: string): string {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch ? mainMatch[1] : html;
  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHeadingLevels(html: string): number[] {
  const matches = html.matchAll(/<h([1-6])\b[^>]*>/gi);
  return [...matches].map((m) => Number(m[1]));
}

describe("Organization schema & product terms", () => {
  it("exposes Organization + LocalBusiness with contactPoint and PostalAddress", () => {
    const graph = generateEntityGraphSchema();
    const org = graph["@graph"].find(
      (node) => node["@id"] === "https://funilcomercial.com/#organization",
    ) as Record<string, any>;

    expect(org["@type"]).toContain("Organization");
    expect(org["@type"]).toContain("LocalBusiness");
    expect(org.address["@type"]).toBe("PostalAddress");
    expect(org.address.addressLocality).toBe("Porto Alegre");
    expect(org.contactPoint[0]["@type"]).toBe("ContactPoint");
    expect(org.contactPoint[0].telephone).toBe("+5551996737359");
    expect(org.contactPoint[0].email).toBe("funil@funilcomercial.com");
    expect(org.contactPoint[0].contactType).toBe("customer service");
    expect(org.knowsAbout).toContain("CRM Funil Comercial");
    expect(org.knowsAbout).toContain("estrutura de vendas para negócios locais");
  });

  it("includes Organization and contactPoint in standalone LocalBusiness schema", () => {
    const org = generateLocalBusinessSchema();
    expect(org["@type"]).toContain("Organization");
    expect(org.contactPoint[0].telephone).toBe("+5551996737359");
    expect(org.contactPoint[0].email).toBe("funil@funilcomercial.com");
    expect(org.address["@type"]).toBe("PostalAddress");
  });
  it("includes Organization, contactPoint, and PostalAddress in generateServiceSchema provider", () => {
    const service = generateServiceSchema("Estrutura de Vendas", "Descrição de teste");
    expect(service.provider["@type"]).toContain("Organization");
    expect(service.provider.contactPoint[0].telephone).toBe("+5551996737359");
    expect(service.provider.address["@type"]).toBe("PostalAddress");
  });
});

describe("SSR public route readiness", () => {
  const routes = [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/blog",
    "/cidades-atendidas",
    "/diagnostico-estrutura-de-vendas",
    "/crm",
    "/glossario",
    "/glossario/seo-local",
    "/blog/google-ads-vs-meta-ads-negocios-locais",
  ];

  for (const route of routes) {
    it(`renders >= 500 raw HTML chars, canonical link, and sequential headings for ${route}`, () => {
      const { html, headTags } = render(route);
      const visibleText = extractMainText(html);
      const headings = getHeadingLevels(html);

      expect(visibleText.length).toBeGreaterThanOrEqual(500);
      expect(headings.filter((level) => level === 1).length).toBe(1);
      expect(headings[0]).toBe(1);
      for (let i = 1; i < headings.length; i += 1) {
        expect(headings[i]).toBeLessThanOrEqual(headings[i - 1] + 1);
      }

      const canonicalExpected =
        route === "/"
          ? "https://funilcomercial.com/"
          : `https://funilcomercial.com${route}`;
      expect(headTags).toContain(`href="${canonicalExpected}"`);
      expect(headTags).toContain('property="og:image"');
      expect(headTags).toContain('property="og:type"');
      expect(headTags).toContain("Funil Comercial");
      expect(html).not.toMatch(/<title\b|<link\b[^>]*rel=["']canonical["']/i);
    });
  }

  it("includes complete Organization contactPoint and address in SSR head JSON-LD on trust pages", () => {
    for (const route of ["/", "/about", "/contact", "/privacy"]) {
      const { headTags } = render(route);
      expect(headTags).toContain("application/ld+json");
      expect(headTags).toContain('"ContactPoint"');
      expect(headTags).toContain('"PostalAddress"');
    }
  });
});
