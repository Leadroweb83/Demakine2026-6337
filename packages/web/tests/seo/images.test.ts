import { describe, expect, test } from "bun:test";
import { imageIssues } from "../../src/api/lib/seo/images";

const O = "https://www.demakine.com.br";
describe("imageIssues", () => {
  const pages = [
    {
      path: "/produtos/x",
      images: [
        { src: `${O}/img/produtos/x/1.webp`, alt: "Esteira Demakine em operação" },
        { src: `${O}/img/produtos/x/esteira-lateral.webp`, alt: null },
        { src: `${O}/img/produtos/x/grande.webp`, alt: "Foto grande da esteira" },
        { src: `${O}/img/produtos/x/boa.webp`, alt: "Esteira com alt e nome bom" },
        { src: "data:image/gif;base64,R0lG", alt: null },
        { src: `${O}/img/produtos/x/vazio.webp`, alt: "   " },
      ],
    },
  ];
  const sizes = new Map([[`${O}/img/produtos/x/grande.webp`, 400 * 1024], [`${O}/img/produtos/x/boa.webp`, 80 * 1024]]);

  test("marca nome numérico, sem alt (ou alt vazio) e pesada; não marca a foto boa nem imagem embutida", () => {
    const r = imageIssues(pages, sizes);
    const by = Object.fromEntries(r.map((i) => [i.src.replace(O, ""), i]));
    expect(by["/img/produtos/x/1.webp"]!.problems).toEqual(["nome-numerico"]);
    expect(by["/img/produtos/x/esteira-lateral.webp"]!.problems).toEqual(["sem-alt"]);
    expect(by["/img/produtos/x/grande.webp"]).toMatchObject({ problems: ["pesada"], bytes: 400 * 1024 });
    expect(by["/img/produtos/x/vazio.webp"]!.problems).toEqual(["sem-alt"]);
    expect(by["/img/produtos/x/boa.webp"]).toBeUndefined();
    expect(r).toHaveLength(4);
    expect(r[0]!.page).toBe("/produtos/x");
  });

  test("a mesma foto na mesma página não repete; combina problemas", () => {
    const r = imageIssues([{ path: "/a", images: [{ src: `${O}/2.jpg`, alt: null }, { src: `${O}/2.jpg`, alt: null }] }], new Map());
    expect(r).toEqual([{ src: `${O}/2.jpg`, page: "/a", problems: ["sem-alt", "nome-numerico"] }]);
  });
});
