import { TemplateWizard } from "@/components/features/agent/template-wizard";

export default function NewTemplatePage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
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
