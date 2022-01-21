import { pauseEvents, terminationEvents } from "./emitters";
import { Workflow, WorkflowMap } from "./types";
import { wait } from "./utils";

const testWorkflow: Workflow = {
  steps: [
    // super simple step
    {
      name: "step_1",
      fn: async () => {
        console.log("starting step 1");

        // do something
        await wait(1000);
      },
    },

    // full blown step that needs to handle some additional logic on pause and termination
    {
      name: "step_2",
      fn: () =>
        new Promise(async (resolve, reject) => {
          console.log("starting step 2");

          const unsubTermEvents = terminationEvents.subscribe(
            ({ workflowName }) => {
              if (workflowName === "testWorkflow") reject("terminated");
            }
          );

          const unsubPauseEvents = pauseEvents.subscribe(
            ({ workflowName, paused }) => {
              if (workflowName === "testWorkflow") {
                // do something... pause queue etc.
              }
            }
          );

          // do something
          await wait(1000);

          unsubPauseEvents();
          unsubTermEvents();

          resolve();
        }),
    },

    // another simple step
    {
      name: "step_3",
      fn: async () => {
        console.log("starting step 3");

        // do something
        await wait(1000);
      },
    },
  ],
};

export const workflowMap: WorkflowMap = {
  testWorkflow,
};
