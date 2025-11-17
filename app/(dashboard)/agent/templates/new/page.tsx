import { TemplateWizard } from "@/components/features/agent/template-wizard";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Create Application Template</h1>
        <p className="text-muted-foreground mt-2">
          Configure requirements for a new building
        </p>
      </div>

      <TemplateWizard />
    </div>
  );
}
