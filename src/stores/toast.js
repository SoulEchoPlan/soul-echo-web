import { defineStore } from 'pinia'

/**
 * Toast Store - 全局提示消息状态管理
 *
 * 提供声明式的 Toast 消息管理，支持四种类型：
 * - info: 信息提示
 * - success: 成功消息
 * - warning: 警告消息
 * - error: 错误消息
 */
export const useToastStore = defineStore('toast', {
  state: () => ({
    visible: false,
    message: '',
    type: 'info', // info | success | warning | error
    timer: null
  }),

  actions: {
    /**
     * 显示 Toast 消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型: 'info' | 'success' | 'warning' | 'error'
     * @param {number} duration - 显示时长（毫秒），默认 3000ms
     */
    show(message, type = 'info', duration = 3000) {
      // 清除之前的定时器
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      // 更新状态
      this.visible = true
      this.message = message
      this.type = type

      // 自动隐藏
      if (duration > 0) {
        this.timer = setTimeout(() => {
          this.hide()
        }, duration)
      }
    },

    /**
     * 隐藏 Toast 消息
     */
    hide() {
      this.visible = false
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },

    /**
     * 显示信息提示
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    info(message, duration) {
      this.show(message, 'info', duration)
    },

    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    success(message, duration) {
      this.show(message, 'success', duration)
    },

    /**
     * 显示警告消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    warning(message, duration) {
      this.show(message, 'warning', duration)
    },

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    error(message, duration) {
      this.show(message, 'error', duration)
    }
  }
})
