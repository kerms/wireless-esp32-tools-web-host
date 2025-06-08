/**
 * @file Composable for managing a task scheduler that executes callbacks at specified intervals.
 * This scheduler avoids time drift and handles race conditions from stale timers.
 */
import { ref, onUnmounted } from 'vue'
import { isDevMode } from './buildMode'

interface ScheduledTask {
  id: string
  intervalMS: number
  nextExecutionTime: number
  executeCallback: () => Promise<void> | void
  oneTime: boolean
  version: number
}

// --- Module-level state (Singleton pattern) ---

/** A sorted array of tasks to be executed. The task at index 0 is always the next one. */
const scheduledTasks = ref<ScheduledTask[]>([])
/** Tracks the latest version for a given task ID to prevent stale timers from running. */
const taskVersions = new Map<string, number>()
/** The ID of the currently active `setTimeout` instance. */
let currentTimerId: number | null = null
/** A reactive flag indicating if the scheduler has any pending tasks. */
export const isSchedulerRunning = ref(false)
/** A lock to prevent concurrent task executions */
let isTaskExecuting = false

export function useCommandLoopManager() {
  // --- Private Scheduler Core ---

  /**
   * Executes the task at the front of the queue and reschedules it if it's recurring.
   */
  const executeNextTask = async () => {
    // If a task is already running, wait before trying to execute the next one.
    if (isTaskExecuting) {
      if (isDevMode()) console.log('[Scheduler] Delaying task execution: another task is already running.')
      // This is a simple back-off strategy.
      currentTimerId = window.setTimeout(executeNextTask, 50)
      return
    }

    if (scheduledTasks.value.length === 0) {
      isSchedulerRunning.value = false
      return
    }

    const taskToExecute = scheduledTasks.value.shift()!

    // Stale check
    const latestVersion = taskVersions.get(taskToExecute.id)
    if (taskToExecute.version !== latestVersion) {
      if (isDevMode()) console.log(`[Scheduler] Discarding stale task '${taskToExecute.id}' v${taskToExecute.version}.`)
      scheduleNextExecution() // The queue has changed, so recalculate.
      return
    }

    // Acquire the lock and execute the callback.
    try {
      isTaskExecuting = true
      if (isDevMode()) console.log(`[Scheduler] Executing task '${taskToExecute.id}' v${taskToExecute.version}`)
      await taskToExecute.executeCallback()
    } catch (error) {
      console.error(`[Scheduler] Error in task '${taskToExecute.id}':`, error)
    } finally {
      isTaskExecuting = false // ALWAYS release the lock
    }

    // If it's a recurring task, reschedule it.
    if (!taskToExecute.oneTime) {
      taskToExecute.nextExecutionTime = Date.now() + taskToExecute.intervalMS
      // Re-insert the task and re-sort the queue.
      scheduledTasks.value.push(taskToExecute)
      scheduledTasks.value.sort((a, b) => a.nextExecutionTime - b.nextExecutionTime)
    } else {
      taskVersions.delete(taskToExecute.id)
    }
    
    // Set the timer for the next task in the queue.
    scheduleNextExecution()
  }

  /**
   * Sets a single master timer for the next task in the queue.
   */
  const scheduleNextExecution = () => {
    if (currentTimerId !== null) {
      window.clearTimeout(currentTimerId)
      currentTimerId = null
    }

    if (scheduledTasks.value.length === 0) {
      isSchedulerRunning.value = false
      return
    }

    const nextTask = scheduledTasks.value[0]
    const timeout = Math.max(0, nextTask.nextExecutionTime - Date.now())

    currentTimerId = window.setTimeout(executeNextTask, timeout)
    isSchedulerRunning.value = true

    if (isDevMode()) {
      console.log(`[Scheduler] Next task '${nextTask.id}' v${nextTask.version} scheduled in ${timeout}ms.`)
    }
  }

  // --- Public API ---

  /**
   * Registers a new task, updates an existing one, or removes a task.
   * This is the single entry point for all scheduling changes.
   * @param id A unique identifier for the task.
   * @param intervalMS The interval in milliseconds. Pass 0 or an invalid value to unregister.
   * @param executeCallback The function to execute.
   * @param oneTime If true, the task runs once and is not rescheduled.
   */
  const registerLoop = (
    id: string,
    intervalMS: number | string,
    executeCallback: () => Promise<void> | void,
    oneTime = false,
  ) => {
    scheduledTasks.value = scheduledTasks.value.filter((task) => task.id !== id)

    const interval = typeof intervalMS === 'string' ? parseInt(intervalMS, 10) : intervalMS
    if (!interval || isNaN(interval) || interval <= 0) {
      if (isDevMode()) console.log(`[Scheduler] Unregistered task '${id}'.`)
      taskVersions.delete(id)
      scheduleNextExecution()
      return
    }

    const newVersion = (taskVersions.get(id) || 0) + 1
    taskVersions.set(id, newVersion)

    const newTask: ScheduledTask = {
      id,
      intervalMS: interval,
      nextExecutionTime: Date.now() + interval,
      executeCallback,
      oneTime,
      version: newVersion,
    }

    scheduledTasks.value.push(newTask)
    scheduledTasks.value.sort((a, b) => a.nextExecutionTime - b.nextExecutionTime)

    if (isDevMode()) {
      console.log(`[Scheduler] Registered task '${id}' v${newVersion} with interval ${interval}ms.`)
    }

    scheduleNextExecution()
  }

  /**
   * A convenience helper to explicitly remove a task from the scheduler.
   * @param id The identifier of the task to remove.
   */
  const unregisterLoop = (id: string) => {
    registerLoop(id, -1, () => {})
  }

  // --- Lifecycle Hook ---

  onUnmounted(() => {
    if (currentTimerId !== null) window.clearTimeout(currentTimerId)
    scheduledTasks.value = []
    taskVersions.clear()
    isSchedulerRunning.value = false
  })

  return { registerLoop, unregisterLoop, isRunning: isSchedulerRunning }
} 