export class ConsentRequiredError extends Error {
  constructor() {
    super("Consentimento de processamento pelo modelo é obrigatório antes da extração.");
    this.name = "ConsentRequiredError";
  }
}

/** FR-003 / specs/INGESTION_PIPELINE.md passo 10: consentimento antes do envio ao modelo. */
export function assertConsent(consentToModelProcessing: boolean): void {
  if (!consentToModelProcessing) {
    throw new ConsentRequiredError();
  }
}
