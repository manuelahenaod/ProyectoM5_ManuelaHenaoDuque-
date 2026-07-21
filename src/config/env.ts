import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. ` +
        `Copiá .env.example a .env y completá los valores.`,
    );
  }
  return value;
}

export const env = {
  GITHUB_TOKEN: required("GITHUB_TOKEN"),
  GITHUB_USERNAME: process.env.GITHUB_USERNAME ?? "",
  GITHUB_TEST_REPO: process.env.GITHUB_TEST_REPO ?? "",
};