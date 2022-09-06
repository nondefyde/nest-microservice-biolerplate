export enum QueueTasks {
  UPLOAD_PHOTO = 'task.upload.photo',
  SEND_EMAIL = 'task.send.email',
  SEND_SMS = 'task.send.sms',
  PING = 'task.send.ping',
}

export enum WorkerQueue {
  PROCESS_WORK = 'finfrac.jobs.process.work',
}