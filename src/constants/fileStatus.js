/**
 * 文件状态枚举
 * 同步后端 FileStatusEnum.java
 */
export const FileStatus = {
  /** 上传中 */
  UPLOADING: 'UPLOADING',
  /** 索引中 */
  INDEXING: 'INDEXING',
  /** 已完成 */
  COMPLETED: 'COMPLETED',
  /** 失败 */
  FAILED: 'FAILED',
  /** 活跃 */
  ACTIVE: 'ACTIVE'
}

/**
 * 文件状态显示文本映射
 */
export const FileStatusText = {
  [FileStatus.UPLOADING]: '上传中',
  [FileStatus.INDEXING]: '索引中',
  [FileStatus.COMPLETED]: '已完成',
  [FileStatus.FAILED]: '失败',
  [FileStatus.ACTIVE]: '活跃'
}

/**
 * 文件状态样式类名映射
 */
export const FileStatusClass = {
  [FileStatus.UPLOADING]: 'uploading-status',
  [FileStatus.INDEXING]: 'indexing-status',
  [FileStatus.COMPLETED]: 'completed-status',
  [FileStatus.FAILED]: 'failed-status',
  [FileStatus.ACTIVE]: 'active-status'
}
