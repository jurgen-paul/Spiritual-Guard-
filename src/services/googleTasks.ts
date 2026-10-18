import { GoogleTask, GoogleTaskList } from '../types/spiritual';

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

async function handleResponse<T>(res: Response, errorMsg: string): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      detail = await res.text();
    }
    throw new Error(`${errorMsg}: ${res.status} ${res.statusText} - ${detail}`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

/**
 * Lists all user Task Lists
 */
export async function listTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const res = await fetch(`${BASE_URL}/users/@me/lists?maxResults=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse<{ items?: GoogleTaskList[] }>(res, 'Failed to fetch task lists');
  return data.items || [];
}

/**
 * Creates a new Task List
 */
export async function createTaskList(accessToken: string, title: string): Promise<GoogleTaskList> {
  const res = await fetch(`${BASE_URL}/users/@me/lists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  return handleResponse<GoogleTaskList>(res, 'Failed to create task list');
}

/**
 * Finds or creates the default "🛡️ Spiritual Guard Core" task list
 */
export async function getOrCreateSpiritualGuardList(accessToken: string): Promise<GoogleTaskList> {
  const lists = await listTaskLists(accessToken);
  const existing = lists.find(
    (l) => l.title.includes('Spiritual Guard') || l.title.includes('Spiritual')
  );
  if (existing) {
    return existing;
  }
  return createTaskList(accessToken, '🛡️ Spiritual Guard Core');
}

/**
 * Deletes a Task List
 */
export async function deleteTaskList(accessToken: string, taskListId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/@me/lists/${taskListId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  await handleResponse<void>(res, 'Failed to delete task list');
}

/**
 * Lists tasks in a specific Task List
 */
export async function listTasks(
  accessToken: string,
  taskListId: string,
  showCompleted = true
): Promise<GoogleTask[]> {
  const url = `${BASE_URL}/lists/${taskListId}/tasks?showCompleted=${showCompleted}&showHidden=true&maxResults=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse<{ items?: GoogleTask[] }>(res, 'Failed to fetch tasks');
  return (data.items || []).filter((task) => !task.deleted);
}

/**
 * Creates a new task in a specific Task List
 */
export async function createTask(
  accessToken: string,
  taskListId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> {
  const body: Record<string, any> = {
    title: task.title,
    notes: task.notes || '',
    status: 'needsAction',
  };

  if (task.due) {
    // Google Tasks API expects RFC 3339 timestamp with UTC midnight
    const dateObj = new Date(task.due);
    if (!isNaN(dateObj.getTime())) {
      body.due = dateObj.toISOString();
    }
  }

  const res = await fetch(`${BASE_URL}/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<GoogleTask>(res, 'Failed to create task');
}

/**
 * Updates a task (title, notes, due date, status)
 */
export async function updateTask(
  accessToken: string,
  taskListId: string,
  taskId: string,
  taskUpdate: { title?: string; notes?: string; status?: 'needsAction' | 'completed'; due?: string }
): Promise<GoogleTask> {
  const body: Record<string, any> = { ...taskUpdate };

  if (taskUpdate.due) {
    const dateObj = new Date(taskUpdate.due);
    if (!isNaN(dateObj.getTime())) {
      body.due = dateObj.toISOString();
    }
  }

  const res = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<GoogleTask>(res, 'Failed to update task');
}

/**
 * Toggles status between needsAction and completed
 */
export async function toggleTaskStatus(
  accessToken: string,
  taskListId: string,
  task: GoogleTask
): Promise<GoogleTask> {
  const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
  const body: Record<string, any> = {
    id: task.id,
    status: newStatus,
  };

  if (newStatus === 'completed') {
    body.completed = new Date().toISOString();
  }

  const res = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${task.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<GoogleTask>(res, 'Failed to toggle task completion');
}

/**
 * Deletes a task
 */
export async function deleteTask(
  accessToken: string,
  taskListId: string,
  taskId: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  await handleResponse<void>(res, 'Failed to delete task');
}

/**
 * Clears all completed tasks in a task list
 */
export async function clearCompletedTasks(
  accessToken: string,
  taskListId: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/lists/${taskListId}/clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  await handleResponse<void>(res, 'Failed to clear completed tasks');
}
