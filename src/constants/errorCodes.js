/**
 * 错误码常量
 * 同步后端 ErrorCode.java
 */
export const ErrorCodes = {
  // ==================== 通用 ====================
  /** 成功 */
  SUCCESS: 0,
  /** 参数无效 */
  PARAM_INVALID: 10001,
  /** 参数缺失 */
  PARAM_MISSING: 10002,
  /** 系统错误 */
  SYSTEM_ERROR: 10301,
  /** 系统繁忙 */
  SYSTEM_BUSY: 10302,

  // ==================== 角色模块 ====================
  /** 角色不存在 */
  CHARACTER_NOT_FOUND: 20201,
  /** 角色名称重复 */
  CHARACTER_NAME_DUPLICATE: 20101,
  /** 角色创建失败 */
  CHARACTER_CREATE_FAILED: 20102,
  /** 角色更新失败 */
  CHARACTER_UPDATE_FAILED: 20103,
  /** 角色删除失败 */
  CHARACTER_DELETE_FAILED: 20104,
  /** 角色查询失败 */
  CHARACTER_QUERY_FAILED: 20105,

  // ==================== 知识库模块 ====================
  /** 知识库不存在 */
  KNOWLEDGE_NOT_FOUND: 30201,
  /** 知识库上传失败 */
  KNOWLEDGE_UPLOAD_FAILED: 30101,
  /** 知识库搜索失败 */
  KNOWLEDGE_SEARCH_FAILED: 30102,
  /** 知识库删除失败 */
  KNOWLEDGE_DELETE_FAILED: 30103,
  /** 知识库文件为空 */
  KNOWLEDGE_FILE_EMPTY: 30001,
  /** 知识库文件过大 */
  KNOWLEDGE_FILE_TOO_LARGE: 30002,

  // ==================== 聊天模块 ====================
  /** 聊天消息为空 */
  CHAT_MESSAGE_EMPTY: 40001,
  /** 聊天会话繁忙 */
  CHAT_SESSION_BUSY: 40101,
  /** LLM 服务错误 */
  CHAT_LLM_ERROR: 40301,
  /** ASR 服务错误 */
  CHAT_ASR_ERROR: 40302,
  /** TTS 服务错误 */
  CHAT_TTS_ERROR: 40303
}

/**
 * 错误码消息映射
 * 用于获取用户友好的错误消息
 */
export const ErrorMessages = {
  [ErrorCodes.SUCCESS]: '操作成功',
  [ErrorCodes.PARAM_INVALID]: '参数无效',
  [ErrorCodes.PARAM_MISSING]: '参数缺失',
  [ErrorCodes.SYSTEM_ERROR]: '系统错误，请稍后重试',
  [ErrorCodes.SYSTEM_BUSY]: '系统繁忙，请稍后重试',

  [ErrorCodes.CHARACTER_NOT_FOUND]: '角色不存在',
  [ErrorCodes.CHARACTER_NAME_DUPLICATE]: '角色名称已存在',
  [ErrorCodes.CHARACTER_CREATE_FAILED]: '角色创建失败',
  [ErrorCodes.CHARACTER_UPDATE_FAILED]: '角色更新失败',
  [ErrorCodes.CHARACTER_DELETE_FAILED]: '角色删除失败',
  [ErrorCodes.CHARACTER_QUERY_FAILED]: '角色查询失败',

  [ErrorCodes.KNOWLEDGE_NOT_FOUND]: '知识库不存在',
  [ErrorCodes.KNOWLEDGE_UPLOAD_FAILED]: '知识库文件上传失败',
  [ErrorCodes.KNOWLEDGE_SEARCH_FAILED]: '知识库搜索失败',
  [ErrorCodes.KNOWLEDGE_DELETE_FAILED]: '知识库删除失败',
  [ErrorCodes.KNOWLEDGE_FILE_EMPTY]: '知识库文件为空',
  [ErrorCodes.KNOWLEDGE_FILE_TOO_LARGE]: '知识库文件过大',

  [ErrorCodes.CHAT_MESSAGE_EMPTY]: '消息内容不能为空',
  [ErrorCodes.CHAT_SESSION_BUSY]: '当前会话繁忙，请稍后重试',
  [ErrorCodes.CHAT_LLM_ERROR]: 'AI 服务暂时不可用',
  [ErrorCodes.CHAT_ASR_ERROR]: '语音识别服务暂时不可用',
  [ErrorCodes.CHAT_TTS_ERROR]: '语音合成服务暂时不可用'
}
