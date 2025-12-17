type RecordedCall = [Request | string]

let requestLog: RecordedCall[] = []

const recordRequestCall = (request: Request | string) => {
  requestLog.push([request])
}

const getRequestLog = (): RecordedCall[] => requestLog

const clearRequestLog = () => {
  requestLog = []
}

export { recordRequestCall, getRequestLog, clearRequestLog }
