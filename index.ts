import { spawnEvents, terminationEvents } from "./emitters";
import { Workflow } from "./types";
import { workflowMap } from "./workflows";

const runningWorkflows: {
  [key: string]: {
    workflow: Workflow;
    paused: boolean;
  };
} = {};

spawnEvents.subscribe(({ workflowName, startFromStep }) => {
  const existingWorkflow = runningWorkflows[workflowName];
  if (existingWorkflow)
    return { success: false, message: "Workflow is already in progress." };

  const workflow = workflowMap[workflowName];

  if (!workflow) return { success: false, message: "Workflow not found." };

  const startingStep = workflow.steps[startFromStep - 1];

  if (!startingStep) {
    return { success: false, message: "Starting step not found." };
  }

  runningWorkflows[workflowName] = {
    workflow,
    paused: false,
  };

  // if you awaited this, you would not be able to use it in the API controller
  // it would wait for the workflow to finish and that would timeout
  // this is intentional
  (async () => {
    const stepsToExecute = workflow.steps.slice(startFromStep - 1);

    let terminated = false;

    const unsubFromTerminationEvents = terminationEvents.subscribe((event) => {
      if (workflowName === event.workflowName) {
        terminated = true;
      }
    });

    for (const step of stepsToExecute) {
      if (terminated) break;
      try {
        await step.fn();
      } catch (e) {
        // if terminated by us don't log the alert
        if (e !== "terminated") {
          console.error(
            `[FATAL] Workflow terminated due to an error. Workflow: ${workflowName}, Step: ${step.name}`
          );

          console.error(e);
        } else console.log("killed");

        break;
      }
    }

    delete runningWorkflows[workflowName];
    unsubFromTerminationEvents();
  })();

  return { success: true };
});

// this will happen in the API controller
(async () => {
  const [response] = await spawnEvents.emit({
    workflowName: "testWorkflow",
    startFromStep: 1,
  });

  console.log(response);
})();
