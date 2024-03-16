import type { Variable, VariablesCreateInput } from "@shelve/types";
import type { Ref } from "vue";

export function useVariables(refresh: Function, projectId: string, projectVars: Variable[]) {
  const projectVariables = ref(projectVars);
  const selectedEnvironment = ref(["production"]);
  const environment = computed(() => selectedEnvironment.value.join("|"));


  const createLoading = ref(false);
  const updateLoading = ref(false);
  const deleteLoading = ref(false);

  const variablesToCreate = ref(1);
  const variablesInput = ref<VariablesCreateInput>({
    projectId: parseInt(projectId),
    variables: [
      {
        index: 1,
        key: "",
        value: "",
        environment: "production",
        projectId: parseInt(projectId),
      },
    ],
  })

  function addVariable() {
    variablesToCreate.value++
    variablesInput.value.variables.push({
      index: variablesToCreate.value,
      key: "",
      value: "",
      environment: environment.value,
      projectId: parseInt(projectId),
    })
  }

  function removeVariable(index: number) {
    variablesToCreate.value--
    variablesInput.value.variables.splice(index, 1)
  }

  watch(selectedEnvironment, () => {
    variablesInput.value.variables.forEach((variable) => {
      variable.environment = environment.value
    })
  })

  const items = [
    [
      {
        label: "Copy .env",
        disabled: true
      }
    ],
    [
      {
        label: "For production",
        icon: "i-lucide-clipboard",
        click: () => copyEnv(projectVars, "production")
      },
      {
        label: "For staging",
        icon: "i-lucide-clipboard",
        click: () => copyEnv(projectVars, "staging")
      },
      {
        label: "For development",
        icon: "i-lucide-clipboard",
        click: () => copyEnv(projectVars, "development")
      }
    ],
    [
      {
        label: "Download .env",
        disabled: true
      },
    ],
    [
      {
        label: "For production",
        icon: "i-lucide-download",
        click: () => downloadEnv(projectVars, "production")
      },
      {
        label: "For staging",
        icon: "i-lucide-download",
        click: () => downloadEnv(projectVars, "staging")
      },
      {
        label: "For development",
        icon: "i-lucide-download",
        click: () => downloadEnv(projectVars, "development")
      }
    ],
  ]

  async function createVariables() {
    createLoading.value = true;
    if (environment.value.length === 0) {
      toast.error("Please select at least one environment");
      createLoading.value = false;
      return;
    }
    try {
      await $fetch(`/api/variable`, {
        method: "POST",
        body: variablesInput.value,
      })
      toast.success("Your variables have been created")
      variablesToCreate.value = 1
      variablesInput.value = {
        projectId: parseInt(projectId),
        variables: [
          {
            index: 1,
            key: "",
            value: "",
            environment: "production",
            projectId: parseInt(projectId),
          },
        ],
      }
    } catch (error) {
      toast.error("An error occurred");
    }
    createLoading.value = false;
    refresh()
  }

  async function updateVariable(variable: Variable) {
    updateLoading.value = true;
    if (variable.environment.length === 0) {
      toast.error("Please select at least one environment");
      updateLoading.value = false;
      return;
    }
    try {
      await $fetch(`/api/variable`, {
        method: "POST",
        body: {
          projectId: parseInt(projectId),
          variables: [variable]
        },
      })
      toast.success("Your variable has been updated")
    } catch (error) {
      toast.error("An error occurred");
    }
    updateLoading.value = false;
    refresh()
  }

  async function deleteVariable(varId: number, varEnv: string) {
    deleteLoading.value = true;
    try {
      await $fetch(`/api/variable/${varId}/${varEnv}`, {
        method: "DELETE",
      })
      toast.success("Your variable has been deleted")
    } catch (error) {
      toast.error("An error occurred");
    }
    deleteLoading.value = false;
    refresh()
  }

  return {
    createLoading,
    updateLoading,
    deleteLoading,
    projectVariables,
    selectedEnvironment,
    environment,
    items,
    variablesInput,
    variablesToCreate,
    addVariable,
    removeVariable,
    createVariables,
    updateVariable,
    deleteVariable
  }
}
