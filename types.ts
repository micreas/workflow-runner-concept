export type Step = {
  name: string;
  fn: () => Promise<void>;
};

export type Workflow = {
  steps: Step[];
};

export type WorkflowMap = { [workflowName: string]: Workflow };
