// ==UserScript==
// @name         样本标注系统增强工具
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  UI优化、多主题切换、十字参考线、右键拖动图片、实时时间、自动正方形框、快捷键修改、标签显示、自动更新
// @author       lijin
// @match        http://10.212.80.215:8901/sample/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @connect      10.212.80.215
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/kirito10010/baidu-mark/master/lijin-baidu-mark.user.js
// @downloadURL  https://raw.githubusercontent.com/kirito10010/baidu-mark/master/lijin-baidu-mark.user.js
// ==/UserScript==

/*
 * ========================================
 * 快捷键说明
 * ========================================
 * 
 * 🎯 十字参考线：
 *    Ctrl + Shift + Alt + P  切换显示/隐藏
 * 
 * 🖱️ 右键拖动图片：
 *    右键拖动          移动图片位置
 *    C / X / A 键      重置图片位置
 * 
 * 🎨 主题切换：
 *    鼠标悬停右下角圆形按钮 → 选择主题
 * 
 * ⏰ 实时时间：
 *    自动显示在导航栏左侧
 * 
 * 📦 自动正方形框：
 *    点击"画框"按钮后，在图片上双击
 *    自动创建100x100的正方形框
 * 
 * ⌨️ 快捷键修改：
 *    Ctrl + Shift + Alt + K  打开快捷键设置弹窗
 * 
 * 🏷️ 标签显示：
 *    Ctrl + Shift + Alt + L  切换标签显示面板
 * 
 * 🔄 检查更新：
 *    Ctrl + Shift + Alt + U  手动检查更新
 * 
 * 💡 标签高亮：
 *    鼠标悬停标签列表中的项目 → 在图片上高亮显示对应标注框
 * 
 * ========================================
 */

(function() {
    'use strict';

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                  navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    let preferredPlatform = GM_getValue('preferredPlatform', 'auto');
    if (preferredPlatform === 'auto') {
        preferredPlatform = isIOS ? 'ios' : (isMac ? 'mac' : 'windows');
    }
    
    const isMacPlatform = preferredPlatform === 'mac' || preferredPlatform === 'ios';
    
    function getModifierKeys() {
        if (isMacPlatform) {
            return {
                ctrl: 'metaKey',
                shift: 'shiftKey',
                alt: 'ctrlKey',
                combo: 'Command + Shift + Ctrl'
            };
        } else {
            return {
                ctrl: 'ctrlKey',
                shift: 'shiftKey',
                alt: 'altKey',
                combo: 'Ctrl + Shift + Alt'
            };
        }
    }
    
    const modifiers = getModifierKeys();
    
    function checkShortcut(e, key) {
        const ctrl = e[modifiers.ctrl];
        const shift = e[modifiers.shift];
        const alt = e[modifiers.alt];
        return ctrl && shift && alt && e.key.toLowerCase() === key;
    }
    
    const currentTheme = GM_getValue('theme', 'tech-blue');
    
    const themes = {
        'tech-blue': {
            name: '科技蓝',
            icon: '🌊',
            '--primary-color': '#3B82F6',
            '--primary-hover': '#2563EB',
            '--secondary-color': '#60A5FA',
            '--accent-color': '#06B6D4',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#F0F9FF',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#E0F2FE',
            '--bg-nav': 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
            '--text-primary': '#1E293B',
            '--text-secondary': '#475569',
            '--text-tertiary': '#94A3B8',
            '--border-color': '#CBD5E1',
            '--border-hover': '#3B82F6',
            '--shadow-color': 'rgba(59, 130, 246, 0.15)',
        },
        'warm-orange': {
            name: '温暖橙',
            icon: '🌅',
            '--primary-color': '#F97316',
            '--primary-hover': '#EA580C',
            '--secondary-color': '#FB923C',
            '--accent-color': '#FBBF24',
            '--success-color': '#10B981',
            '--warning-color': '#FBBF24',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#FFFBEB',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#FEF3C7',
            '--bg-nav': 'linear-gradient(135deg, #C2410C 0%, #F97316 50%, #FDBA74 100%)',
            '--text-primary': '#451A03',
            '--text-secondary': '#78350F',
            '--text-tertiary': '#A16207',
            '--border-color': '#FED7AA',
            '--border-hover': '#F97316',
            '--shadow-color': 'rgba(249, 115, 22, 0.15)',
        },
        'forest-green': {
            name: '森林绿',
            icon: '🌲',
            '--primary-color': '#10B981',
            '--primary-hover': '#059669',
            '--secondary-color': '#34D399',
            '--accent-color': '#6EE7B7',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#F0FDF4',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#DCFCE7',
            '--bg-nav': 'linear-gradient(135deg, #064E3B 0%, #10B981 50%, #6EE7B7 100%)',
            '--text-primary': '#14532D',
            '--text-secondary': '#166534',
            '--text-tertiary': '#4ADE80',
            '--border-color': '#BBF7D0',
            '--border-hover': '#10B981',
            '--shadow-color': 'rgba(16, 185, 129, 0.15)',
        },
        'elegant-purple': {
            name: '优雅紫',
            icon: '💜',
            '--primary-color': '#8B5CF6',
            '--primary-hover': '#7C3AED',
            '--secondary-color': '#A78BFA',
            '--accent-color': '#C4B5FD',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#FAF5FF',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#F3E8FF',
            '--bg-nav': 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 50%, #C4B5FD 100%)',
            '--text-primary': '#3B0764',
            '--text-secondary': '#6B21A8',
            '--text-tertiary': '#A855F7',
            '--border-color': '#E9D5FF',
            '--border-hover': '#8B5CF6',
            '--shadow-color': 'rgba(139, 92, 246, 0.15)',
        },
        'minimal-white': {
            name: '极简白',
            icon: '⬜',
            '--primary-color': '#64748B',
            '--primary-hover': '#475569',
            '--secondary-color': '#94A3B8',
            '--accent-color': '#CBD5E1',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#FFFFFF',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#F8FAFC',
            '--bg-nav': 'linear-gradient(135deg, #334155 0%, #64748B 50%, #94A3B8 100%)',
            '--text-primary': '#0F172A',
            '--text-secondary': '#334155',
            '--text-tertiary': '#64748B',
            '--border-color': '#E2E8F0',
            '--border-hover': '#64748B',
            '--shadow-color': 'rgba(0, 0, 0, 0.08)',
        },
        'dark-mode': {
            name: '暗夜黑',
            icon: '🌙',
            '--primary-color': '#60A5FA',
            '--primary-hover': '#3B82F6',
            '--secondary-color': '#818CF8',
            '--accent-color': '#A78BFA',
            '--success-color': '#34D399',
            '--warning-color': '#FBBF24',
            '--danger-color': '#F87171',
            '--info-color': '#22D3EE',
            '--bg-primary': '#0A0E1A',
            '--bg-secondary': '#151B2D',
            '--bg-tertiary': '#0F172A',
            '--bg-nav': 'linear-gradient(135deg, #0F172A 0%, #151B2D 50%, #1E293B 100%)',
            '--text-primary': '#FFFFFF',
            '--text-secondary': '#F3F4F6',
            '--text-tertiary': '#D1D5DB',
            '--border-color': '#374151',
            '--border-hover': '#60A5FA',
            '--shadow-color': 'rgba(0, 0, 0, 0.5)',
        },
        'rose-pink': {
            name: '玫瑰粉',
            icon: '🌸',
            '--primary-color': '#EC4899',
            '--primary-hover': '#DB2777',
            '--secondary-color': '#F472B6',
            '--accent-color': '#FBCFE8',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#FDF2F8',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#FCE7F3',
            '--bg-nav': 'linear-gradient(135deg, #9D174D 0%, #EC4899 50%, #FBCFE8 100%)',
            '--text-primary': '#831843',
            '--text-secondary': '#9F1239',
            '--text-tertiary': '#DB2777',
            '--border-color': '#FBCFE8',
            '--border-hover': '#EC4899',
            '--shadow-color': 'rgba(236, 72, 153, 0.15)',
        },
        'ocean-teal': {
            name: '海洋青',
            icon: '🌊',
            '--primary-color': '#14B8A6',
            '--primary-hover': '#0D9488',
            '--secondary-color': '#2DD4BF',
            '--accent-color': '#5EEAD4',
            '--success-color': '#10B981',
            '--warning-color': '#F59E0B',
            '--danger-color': '#EF4444',
            '--info-color': '#06B6D4',
            '--bg-primary': '#F0FDFA',
            '--bg-secondary': '#FFFFFF',
            '--bg-tertiary': '#CCFBF1',
            '--bg-nav': 'linear-gradient(135deg, #134E4A 0%, #14B8A6 50%, #5EEAD4 100%)',
            '--text-primary': '#042F2E',
            '--text-secondary': '#115E59',
            '--text-tertiary': '#0D9488',
            '--border-color': '#99F6E4',
            '--border-hover': '#14B8A6',
            '--shadow-color': 'rgba(20, 184, 166, 0.15)',
        }
    };

    function generateThemeCSS(themeName) {
        const theme = themes[themeName];
        return `
            :root {
                ${Object.entries(theme).map(([key, value]) => typeof value === 'string' ? `${key}: ${value};` : '').join('\n                ')}
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: var(--bg-primary);
                color: var(--text-primary);
            }

            .gk-nav {
                background: var(--bg-nav) !important;
                box-shadow: 0 4px 20px var(--shadow-color) !important;
            }

            .gk-nav-logo img {
                filter: brightness(0) invert(1);
            }

            .gk-nav-list li {
                transition: all 0.2s ease;
            }

            .gk-nav-list li a {
                color: rgba(255, 255, 255, 0.85) !important;
                transition: all 0.2s ease;
            }

            .gk-nav-list li:hover {
                background: rgba(255, 255, 255, 0.15) !important;
                border-radius: 4px;
            }

            .gk-nav-list li:hover a {
                color: white !important;
            }

            .gk-nav-list li.active {
                background: rgba(255, 255, 255, 0.25) !important;
                border-radius: 4px;
            }

            .gk-nav-list li.active a {
                color: white !important;
                font-weight: 600 !important;
            }

            .gk-nav-user {
                color: white;
            }

            .gk-nav-user span {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                font-weight: 500;
            }

            .gk-nav-user a {
                color: white !important;
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                font-weight: 500;
            }

            .gk-nav-user a:hover {
                background: rgba(255, 255, 255, 0.25);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .gk-detail-side {
                background: var(--bg-secondary);
                border-right: 1px solid var(--border-color);
            }

            .gk-detail-pics li {
                background: var(--bg-tertiary) !important;
            }

            .gk-detail-pics li:hover {
                background: var(--bg-tertiary) !important;
                box-shadow: 0 2px 8px var(--shadow-color);
            }

            .gk-detail-pics li.active {
                background: var(--bg-tertiary) !important;
                box-shadow: 0 2px 8px var(--shadow-color);
                border-left: 3px solid var(--primary-color);
            }

            .gk-detail-pics li .fl {
                color: var(--text-primary);
            }

            .gk-detail-types {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
            }

            .gk-detail-types button {
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
            }

            .gk-detail-types button:hover {
                box-shadow: 0 4px 12px var(--shadow-color);
                transform: translateY(-2px);
            }

            .gk-detail-types button.active {
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 3px white !important;
                transform: translateY(-2px) scale(1.05);
                border: 3px solid white !important;
                font-weight: 700 !important;
            }

            .gk-detail-types button:disabled {
                opacity: 0.5;
            }

            .gk-detail-actions {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
            }

            .gk-detail-actions .btn {
                border-radius: 4px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .gk-detail-actions .btn-primary {
                background: var(--primary-color);
                color: white;
                border: 1px solid var(--primary-color);
            }

            .gk-detail-actions .btn-primary:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
            }

            .gk-detail-actions .btn-default {
                background: #E0E0E0 !important;
                color: #333333 !important;
                border: 1px solid #CCCCCC !important;
            }

            .gk-detail-actions .btn-default:hover {
                background: #D0D0D0 !important;
                border-color: #999999 !important;
                color: #333333 !important;
            }

            .gk-detail-actions .btn-default:disabled {
                background: #E0E0E0 !important;
                color: #333333 !important;
                border: 1px solid #CCCCCC !important;
                opacity: 0.6 !important;
                cursor: not-allowed !important;
            }

            .gk-detail-actions .btn-info {
                background: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
                color: white !important;
                opacity: 1 !important;
                box-shadow: 0 2px 8px var(--shadow-color) !important;
                cursor: default !important;
            }

            .gk-detail-actions label {
                color: var(--text-secondary);
            }

            .gk-detail-actions span {
                color: var(--primary-color);
                font-weight: 600;
            }

            .gk-detail-label {
                color: var(--text-secondary);
            }

            .gk-detail-span {
                color: var(--success-color);
                font-weight: 600;
            }

            .gk-detail-select {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            .gk-detail-select:focus {
                border-color: var(--primary-color);
                outline: none;
            }

            .gk-detail-main {
                background: var(--bg-primary);
            }

            .gk-detail-outer {
                background: var(--bg-secondary);
                box-shadow: 0 4px 20px var(--shadow-color);
                border: 1px solid var(--border-color);
            }

            .form-control {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            .form-control:focus {
                border-color: var(--primary-color);
                outline: none;
            }

            .form-control[readonly] {
                background: var(--bg-tertiary);
                color: var(--text-secondary);
            }

            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            ::-webkit-scrollbar-track {
                background: var(--bg-tertiary);
            }

            ::-webkit-scrollbar-thumb {
                background: var(--primary-color);
            }

            ::-webkit-scrollbar-thumb:hover {
                background: var(--primary-hover);
            }

            .modal-content {
                background: var(--bg-secondary);
                border: none;
                box-shadow: 0 10px 40px var(--shadow-color);
            }

            .modal-header {
                background: var(--bg-nav);
                color: white;
                border-bottom: none;
            }

            .modal-body {
                background: var(--bg-secondary);
            }

            .modal-footer {
                background: var(--bg-secondary);
                border-top: 1px solid var(--border-color);
            }

            .modal .close {
                color: white;
                opacity: 0.8;
            }

            .modal .close:hover {
                color: white;
                opacity: 1;
            }

            .text-danger {
                color: var(--danger-color) !important;
            }

            #theme-selector {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }

            #theme-selector-btn {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                border: 3px solid white;
                box-shadow: 0 4px 20px var(--shadow-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
            }

            #theme-selector-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px var(--shadow-color);
            }

            #theme-selector-list {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: var(--bg-secondary);
                border: 2px solid var(--border-color);
                box-shadow: 0 4px 20px var(--shadow-color);
                border-radius: 12px;
                padding: 8px;
                min-width: 180px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s ease;
            }

            #theme-selector:hover #theme-selector-list {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .theme-option {
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                border-radius: 6px;
                transition: background 0.2s ease;
            }

            .theme-option:hover {
                background: var(--bg-tertiary);
            }

            .theme-option.active {
                background: var(--bg-tertiary);
                border-left: 3px solid var(--primary-color);
            }

            .theme-option-icon {
                font-size: 18px;
            }

            .theme-option-name {
                flex: 1;
            }

            .theme-option-check {
                color: var(--success-color);
                font-weight: 700;
                opacity: 0;
            }

            .theme-option.active .theme-option-check {
                opacity: 1;
            }

            .shortcut-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .shortcut-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .shortcut-modal {
                background: var(--bg-secondary);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                width: 600px;
                max-height: 80vh;
                transform: scale(0.9);
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
            }

            .shortcut-modal-overlay.active .shortcut-modal {
                transform: scale(1);
            }

            .shortcut-modal-header {
                background: var(--bg-nav);
                color: white;
                padding: 16px 20px;
                border-radius: 12px 12px 0 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            }

            .shortcut-modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .shortcut-modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .shortcut-modal-close:hover {
                opacity: 1;
            }

            .shortcut-modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .platform-selector {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .platform-label {
                font-weight: 600;
                color: #333;
            }
            
            .platform-select {
                padding: 6px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                cursor: pointer;
            }
            
            .platform-hint {
                font-size: 12px;
                color: #666;
                font-weight: 500;
            }

            .shortcut-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .shortcut-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: var(--bg-tertiary);
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .shortcut-item:hover {
                background: var(--bg-primary);
                box-shadow: 0 2px 8px var(--shadow-color);
            }

            .shortcut-item-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .shortcut-item-name {
                flex: 1;
                font-weight: 600;
                color: var(--text-primary);
            }

            .shortcut-item-input {
                width: 80px;
                padding: 8px 12px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                text-align: center;
                text-transform: uppercase;
                transition: all 0.2s ease;
            }

            .shortcut-item-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px var(--shadow-color);
            }

            .shortcut-item-original {
                font-size: 12px;
                color: var(--text-tertiary);
                margin-left: 8px;
                min-width: 60px;
            }

            .shortcut-modal-footer {
                padding: 16px 20px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .shortcut-hint {
                font-size: 13px;
                color: var(--text-tertiary);
            }

            .shortcut-footer-btns {
                display: flex;
                gap: 12px;
            }

            .shortcut-btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }

            .shortcut-btn-cancel {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }

            .shortcut-btn-cancel:hover {
                background: var(--border-color);
            }

            .shortcut-btn-save {
                background: var(--primary-color);
                color: white;
            }

            .shortcut-btn-save:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px var(--shadow-color);
            }

            .shortcut-btn-reset {
                background: var(--warning-color);
                color: white;
            }

            .shortcut-btn-reset:hover {
                background: #D97706;
                transform: translateY(-1px);
            }
        `;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'modern-ui-theme';
    styleElement.textContent = generateThemeCSS(currentTheme);
    
    if (document.head) {
        document.head.appendChild(styleElement);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(styleElement);
        });
    }

    function createThemeSelector() {
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        
        const currentTheme = GM_getValue('theme', 'tech-blue');
        const currentThemeData = themes[currentTheme];
        
        selector.innerHTML = `
            <div id="theme-selector-btn">${currentThemeData.icon}</div>
            <div id="theme-selector-list">
                ${Object.entries(themes).map(([key, theme]) => `
                    <div class="theme-option ${key === currentTheme ? 'active' : ''}" data-theme="${key}">
                        <span class="theme-option-icon">${theme.icon}</span>
                        <span class="theme-option-name">${theme.name}</span>
                        <span class="theme-option-check">✓</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(selector);
        
        selector.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const themeKey = e.currentTarget.dataset.theme;
                GM_setValue('theme', themeKey);
                
                const styleEl = document.getElementById('modern-ui-theme');
                if (styleEl) {
                    styleEl.textContent = generateThemeCSS(themeKey);
                }
                
                selector.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                const themeData = themes[themeKey];
                selector.querySelector('#theme-selector-btn').textContent = themeData.icon;
            });
        });
    }

    function addSVIPIcon() {
        const userSpan = document.querySelector('.gk-nav-user span');
        if (userSpan && !userSpan.querySelector('.svip-icon')) {
            const svipIcon = document.createElement('span');
            svipIcon.className = 'svip-icon';
            svipIcon.innerHTML = '👑';
            svipIcon.style.cssText = 'margin-right: 4px; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; vertical-align: middle; position: relative; top: -1px;';
            userSpan.insertBefore(svipIcon, userSpan.firstChild);
        }
    }

    function addTimeDisplay() {
        const userDiv = document.querySelector('.gk-nav-user');
        if (userDiv && !userDiv.querySelector('.time-display')) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time-display';
            timeSpan.style.cssText = `
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                padding: 6px 14px;
                font-weight: 700;
                font-size: 16px;
                font-family: 'Courier New', monospace;
                margin-right: 12px;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                letter-spacing: 1px;
            `;
            
            userDiv.insertBefore(timeSpan, userDiv.firstChild);
            
            function updateTime() {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                timeSpan.textContent = `${hours}:${minutes}:${seconds}`;
            }
            
            updateTime();
            setInterval(updateTime, 1000);
        }
    }

    function createCrosshair() {
        const horizontalLine = document.createElement('div');
        horizontalLine.id = 'crosshair-horizontal';
        horizontalLine.style.cssText = `
            position: fixed;
            left: 0;
            right: 0;
            height: 2px;
            background: transparent;
            border-top: 2px dashed #FF0000;
            pointer-events: none;
            z-index: 9998;
            display: block;
            opacity: 0.6;
        `;

        const verticalLine = document.createElement('div');
        verticalLine.id = 'crosshair-vertical';
        verticalLine.style.cssText = `
            position: fixed;
            top: 0;
            bottom: 0;
            width: 2px;
            background: transparent;
            border-left: 2px dashed #FF0000;
            pointer-events: none;
            z-index: 9998;
            display: block;
            opacity: 0.6;
        `;

        document.body.appendChild(horizontalLine);
        document.body.appendChild(verticalLine);

        let isVisible = GM_getValue('crosshairVisible', true);
        let moveTimeout = null;
        
        if (!isVisible) {
            horizontalLine.style.display = 'none';
            verticalLine.style.display = 'none';
        }

        document.addEventListener('keydown', (e) => {
            if (checkShortcut(e, 'p')) {
                e.preventDefault();
                const activeElement = document.activeElement;
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    return;
                }
                
                isVisible = !isVisible;
                GM_setValue('crosshairVisible', isVisible);
                
                if (!isVisible) {
                    horizontalLine.style.display = 'none';
                    verticalLine.style.display = 'none';
                } else {
                    horizontalLine.style.display = 'block';
                    verticalLine.style.display = 'block';
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isVisible) return;

            horizontalLine.style.top = e.clientY + 'px';
            horizontalLine.style.display = 'block';
            
            verticalLine.style.left = e.clientX + 'px';
            verticalLine.style.display = 'block';

            if (moveTimeout) {
                clearTimeout(moveTimeout);
            }

            moveTimeout = setTimeout(() => {
                horizontalLine.style.opacity = '0.3';
                verticalLine.style.opacity = '0.3';
            }, 2000);

            horizontalLine.style.opacity = '0.6';
            verticalLine.style.opacity = '0.6';
        });
    }

    function initRightClickDrag() {
        let isDragging = false;
        let targetElement = null;
        let startX, startY;
        let startMarginLeft = 0;
        let startMarginTop = 0;
        let hasMoved = false;
        const MOVE_THRESHOLD = 5;

        function createOverlay() {
            const div = document.createElement('div');
            div.id = '__img_drag_overlay__';
            div.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2147483646;
                cursor: grabbing;
                background: transparent;
                pointer-events: auto;
            `;
            return div;
        }

        function findPhotoElement(element) {
            if (!element) return null;

            let current = element;
            
            while (current && current !== document.body && current !== document) {
                if (current.classList.contains('gk-detail-inner')) {
                    return current;
                }
                if (current.classList.contains('gk-detail-outer')) {
                    const inner = current.querySelector('.gk-detail-inner');
                    if (inner) return inner;
                }
                if (current.tagName && current.tagName.toLowerCase() === 'img') {
                    return current;
                }

                current = current.parentElement;
            }

            return null;
        }

        function getPhotoContainer() {
            return document.querySelector('.gk-detail-inner');
        }

        function resetPhotoPosition() {
            const photoElement = getPhotoContainer();
            if (photoElement) {
                photoElement.style.marginLeft = '0px';
                photoElement.style.marginTop = '0px';
            }
        }

        function getMargin(element) {
            const style = window.getComputedStyle(element);
            return {
                left: parseFloat(style.marginLeft) || 0,
                top: parseFloat(style.marginTop) || 0
            };
        }

        function handleContextMenu(e) {
            if (isDragging && hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }

        function handleKeyDown(e) {
            const key = e.key.toLowerCase();
            if (key === 'c' || key === 'x' || key === 'a') {
                setTimeout(function() {
                    resetPhotoPosition();
                    removeHighlightBox();
                }, 200);
            }
        }

        function handleMouseDown(e) {
            if (e.button !== 2) return;

            const target = e.target;
            const photoElement = findPhotoElement(target);
            
            if (!photoElement) {
                return;
            }

            isDragging = true;
            hasMoved = false;
            targetElement = photoElement;
            startX = e.clientX;
            startY = e.clientY;

            const margin = getMargin(photoElement);
            startMarginLeft = margin.left;
            startMarginTop = margin.top;

            const overlay = createOverlay();
            document.body.appendChild(overlay);

            document.addEventListener('contextmenu', handleContextMenu, true);
            document.addEventListener('mousemove', handleMouseMove, true);
            document.addEventListener('mouseup', handleMouseUp, true);
        }

        function handleMouseMove(e) {
            if (!isDragging || !targetElement) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MOVE_THRESHOLD) {
                hasMoved = true;
            }

            if (!hasMoved) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            targetElement.style.marginLeft = (startMarginLeft + dx) + 'px';
            targetElement.style.marginTop = (startMarginTop + dy) + 'px';

            const horizontalLine = document.getElementById('crosshair-horizontal');
            const verticalLine = document.getElementById('crosshair-vertical');
            if (horizontalLine && verticalLine) {
                horizontalLine.style.top = e.clientY + 'px';
                verticalLine.style.left = e.clientX + 'px';
            }

            return false;
        }

        function handleMouseUp(e) {
            if (!isDragging) return;

            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }

            isDragging = false;
            targetElement = null;
            hasMoved = false;

            const overlay = document.getElementById('__img_drag_overlay__');
            if (overlay) {
                overlay.remove();
            }

            document.removeEventListener('contextmenu', handleContextMenu, true);
            document.removeEventListener('mousemove', handleMouseMove, true);
            document.removeEventListener('mouseup', handleMouseUp, true);

            return false;
        }

        document.addEventListener('mousedown', handleMouseDown, true);

        document.addEventListener('contextmenu', function(e) {
            if (isDragging && hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);

        document.addEventListener('keydown', handleKeyDown, true);
    }

    function initAutoSquare() {
        const SQUARE_SIZE = 100;
        let lastClickTime = 0;
        let lastClickPos = null;
        const DOUBLE_CLICK_DELAY = 300;
        const DOUBLE_CLICK_DISTANCE = 10;

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'c' || key === 'x' || key === 'a') {
                console.log(`🔄 按键 ${key.toUpperCase()} 重置双击检测状态 (之前: time=${lastClickTime}, pos=${JSON.stringify(lastClickPos)})`);
                lastClickTime = 0;
                lastClickPos = null;
            }
        }, true);

        function simulateDrag(startX, startY, size) {
            const svg = document.querySelector('#j-svg');
            if (!svg) {
                console.warn('⚠️ SVG元素未找到');
                return;
            }

            const rect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            const scaleX = viewBox.width / rect.width;
            const scaleY = viewBox.height / rect.height;

            const clientEndX = startX + size / scaleX;
            const clientEndY = startY + size / scaleY;

            const mousedownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                clientX: startX,
                clientY: startY,
                button: 0,
                buttons: 1
            });

            const mousemoveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: clientEndX,
                clientY: clientEndY,
                button: 0,
                buttons: 1
            });

            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                clientX: clientEndX,
                clientY: clientEndY,
                button: 0,
                buttons: 0
            });

            console.log(`🖱️ 开始模拟拖拽: (${startX}, ${startY}) → (${clientEndX}, ${clientEndY})`);

            svg.dispatchEvent(mousedownEvent);
            
            setTimeout(() => {
                svg.dispatchEvent(mousemoveEvent);
                svg.dispatchEvent(mouseupEvent);
                console.log(`✅ 已模拟拖拽创建正方形框 (${size}x${size})`);
            }, 300);
        }

        document.addEventListener('click', (e) => {
            if (e.button !== 0) return;

            console.log(`🖱️ 点击事件触发: clientX=${e.clientX}, clientY=${e.clientY}, target=${e.target.tagName}`);

            if (e.clientX === 0 && e.clientY === 0) {
                console.log('⚠️ 坐标为(0,0)，跳过（可能是程序触发的点击）');
                return;
            }

            if (e.target.closest('polygon') || e.target.closest('circle') || 
                e.target.closest('text') || e.target.closest('image')) {
                console.log('⚠️ 点击在已有框上，跳过自动正方形');
                return;
            }

            const svg = document.querySelector('#j-svg') || document.querySelector('svg.main-svg');
            if (!svg) {
                console.warn('⚠️ SVG元素未找到');
                return;
            }

            const rect = svg.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom) {
                console.log('⚠️ 点击不在SVG区域内，跳过');
                return;
            }

            const drawButton = document.querySelector('button[ng-click="drawRectBtn()"]');
            if (!drawButton) {
                console.warn('⚠️ 画框按钮未找到');
                return;
            }

            if (!drawButton.classList.contains('btn-primary')) {
                console.log('⚠️ 画框按钮未激活');
                return;
            }

            const currentTime = Date.now();
            const currentPos = { x: e.clientX, y: e.clientY };

            console.log(`📊 双击检测: timeDiff=${currentTime - lastClickTime}ms, lastPos=${JSON.stringify(lastClickPos)}, currentPos=${JSON.stringify(currentPos)}`);

            if (currentTime - lastClickTime < DOUBLE_CLICK_DELAY && lastClickPos) {
                const distance = Math.sqrt(
                    Math.pow(currentPos.x - lastClickPos.x, 2) +
                    Math.pow(currentPos.y - lastClickPos.y, 2)
                );

                console.log(`📏 双击距离: ${distance.toFixed(1)}px (阈值: ${DOUBLE_CLICK_DISTANCE}px)`);

                if (distance < DOUBLE_CLICK_DISTANCE) {
                    console.log(`✅ 检测到有效双击，开始模拟拖拽...`);
                    simulateDrag(e.clientX, e.clientY, SQUARE_SIZE);
                    lastClickTime = 0;
                    lastClickPos = null;
                } else {
                    console.log(`⚠️ 双击距离过大，跳过`);
                    lastClickTime = currentTime;
                    lastClickPos = currentPos;
                }
            } else {
                console.log(`📝 记录第一次点击`);
                lastClickTime = currentTime;
                lastClickPos = currentPos;
            }
        }, true);

        console.log('📦 自动正方形框功能已启用（双击画框时模拟拖拽创建100x100正方形）');
    }

    let shortcutMapping = GM_getValue('shortcutMapping', {});
    let originalShortcuts = {};
    let platformOriginalShortcuts = GM_getValue('platformOriginalShortcuts', null);
    let shortcutInterceptionEnabled = GM_getValue('shortcutInterceptionEnabled', true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const taskFlowList = urlParams.get('taskFlowList');
    if (taskFlowList === '2') {
        shortcutInterceptionEnabled = false;
        console.log('📋 taskFlowList=2，快捷键拦截已禁用');
    }

    function createShortcutModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'shortcut-modal-overlay';
        modalOverlay.id = 'shortcut-modal-overlay';
        
        modalOverlay.innerHTML = `
            <div class="shortcut-modal">
                <div class="shortcut-modal-header">
                    <h3>⌨️ 快捷键设置</h3>
                    <button class="shortcut-modal-close" id="shortcut-modal-close-btn">×</button>
                </div>
                <div class="shortcut-modal-body">
                    <div class="platform-selector">
                        <span class="platform-label">💻 平台选择：</span>
                        <select id="platform-select" class="platform-select">
                            <option value="auto" ${preferredPlatform === 'auto' ? 'selected' : ''}>自动检测</option>
                            <option value="windows" ${preferredPlatform === 'windows' ? 'selected' : ''}>Windows</option>
                            <option value="mac" ${preferredPlatform === 'mac' ? 'selected' : ''}>Mac</option>
                            <option value="ios" ${preferredPlatform === 'ios' ? 'selected' : ''}>iOS</option>
                        </select>
                        <span class="platform-hint">当前: ${isMacPlatform ? 'Cmd+Shift+Ctrl' : 'Ctrl+Shift+Alt'}</span>
                    </div>
                    <div class="shortcut-list" id="shortcut-list">
                    </div>
                </div>
                <div class="shortcut-modal-footer">
                    <div class="shortcut-hint">💡 点击输入框后按下新快捷键</div>
                    <div class="shortcut-footer-btns">
                        <button class="shortcut-btn shortcut-btn-reset" id="shortcut-reset-all-btn">重置全部</button>
                        <button class="shortcut-btn shortcut-btn-cancel" id="shortcut-cancel-btn">取消</button>
                        <button class="shortcut-btn shortcut-btn-save" id="shortcut-save-btn">保存</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        const closeBtn = modalOverlay.querySelector('#shortcut-modal-close-btn');
        const cancelBtn = modalOverlay.querySelector('#shortcut-cancel-btn');
        const saveBtn = modalOverlay.querySelector('#shortcut-save-btn');
        const resetBtn = modalOverlay.querySelector('#shortcut-reset-all-btn');
        const platformSelect = modalOverlay.querySelector('#platform-select');
        const platformHint = modalOverlay.querySelector('.platform-hint');
        
        closeBtn.addEventListener('click', closeShortcutModal);
        cancelBtn.addEventListener('click', closeShortcutModal);
        saveBtn.addEventListener('click', () => saveAllShortcuts(platformSelect.value));
        resetBtn.addEventListener('click', resetAllShortcuts);
        
        platformSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            const isMac = selected === 'mac' || selected === 'ios';
            platformHint.textContent = `当前: ${isMac ? 'Cmd+Shift+Ctrl' : 'Ctrl+Shift+Alt'}`;
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeShortcutModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('shortcut-modal-overlay');
                if (modal && modal.classList.contains('active')) {
                    closeShortcutModal();
                }
            }
        });
    }

    function closeShortcutModal() {
        const modalOverlay = document.getElementById('shortcut-modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    }

    function openShortcutModal() {
        let modalOverlay = document.getElementById('shortcut-modal-overlay');
        if (!modalOverlay) {
            createShortcutModal();
            modalOverlay = document.getElementById('shortcut-modal-overlay');
        }
        
        const typeButtons = document.querySelectorAll('.gk-detail-types button[ng-repeat="type in types"]');
        const shortcutList = document.getElementById('shortcut-list');
        
        if (!shortcutList) return;
        
        shortcutList.innerHTML = '';
        originalShortcuts = {};
        
        typeButtons.forEach((button, index) => {
            const strongEl = button.querySelector('strong');
            if (!strongEl) return;
            
            const fullText = button.textContent.trim();
            const nameMatch = fullText.match(/\[.+?\]\s*(.+)/);
            const typeName = nameMatch ? nameMatch[1].trim() : '未知标签';
            
            const shortcutText = strongEl.textContent.trim();
            const match = shortcutText.match(/\[(.+?)\]/);
            const originalKey = match ? match[1].toLowerCase() : '';
            
            const buttonStyle = button.getAttribute('style') || '';
            const colorMatch = buttonStyle.match(/background:\s*([^;]+)/);
            const buttonColor = colorMatch ? colorMatch[1].trim() : '#999999';
            
            originalShortcuts[typeName] = originalKey;
            
            if (!shortcutMapping[typeName]) {
                shortcutMapping[typeName] = originalKey;
            }
            
            const currentKey = shortcutMapping[typeName] || originalKey;
            const platformOriginalKey = platformOriginalShortcuts ? platformOriginalShortcuts[typeName] : originalKey;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shortcut-item';
            itemDiv.innerHTML = `
                <div class="shortcut-item-color" style="background: ${buttonColor}"></div>
                <div class="shortcut-item-name">${typeName}</div>
                <input type="text" class="shortcut-item-input" 
                       data-type-name="${typeName}" 
                       value="${currentKey.toUpperCase()}" 
                       readonly>
                <div class="shortcut-item-original">原: ${platformOriginalKey ? platformOriginalKey.toUpperCase() : originalKey.toUpperCase()}</div>
            `;
            
            const input = itemDiv.querySelector('.shortcut-item-input');
            input.addEventListener('keydown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (e.key === 'Escape') {
                    closeShortcutModal();
                    return;
                }
                
                let key = e.key;
                if (key === ' ') key = 'Space';
                if (key.length === 1) {
                    input.value = key.toUpperCase();
                    input.dataset.newKey = key.toLowerCase();
                }
            });
            
            input.addEventListener('focus', () => {
                input.select();
            });
            
            shortcutList.appendChild(itemDiv);
        });
        
        modalOverlay.classList.add('active');
    }

    function saveAllShortcuts(platform = preferredPlatform) {
        const inputs = document.querySelectorAll('.shortcut-item-input');
        const newMapping = {};
        const conflicts = [];
        
        inputs.forEach((input) => {
            const typeName = input.dataset.typeName;
            const newKey = input.dataset.newKey || input.value.toLowerCase();
            
            if (newMapping[newKey]) {
                conflicts.push(`快捷键 "${newKey.toUpperCase()}" 被多个标签使用`);
            }
            
            newMapping[typeName] = newKey;
        });
        
        if (conflicts.length > 0) {
            alert('存在快捷键冲突：\n' + conflicts.join('\n'));
            return;
        }
        
        shortcutMapping = newMapping;
        GM_setValue('shortcutMapping', shortcutMapping);
        
        preferredPlatform = platform;
        GM_setValue('preferredPlatform', platform);
        
        shortcutInterceptionEnabled = true;
        GM_setValue('shortcutInterceptionEnabled', true);
        
        updateButtonShortcuts();
        closeShortcutModal();
        
        console.log('✅ 所有快捷键已保存');
    }

    function resetAllShortcuts() {
        if (confirm('确定要重置所有快捷键为默认值并停止快捷键拦截吗？')) {
            if (!platformOriginalShortcuts || Object.keys(platformOriginalShortcuts).length === 0) {
                alert('未找到平台原始快捷键数据，请刷新页面后重试！');
                return;
            }
            
            shortcutMapping = {...platformOriginalShortcuts};
            GM_setValue('shortcutMapping', shortcutMapping);
            
            shortcutInterceptionEnabled = false;
            GM_setValue('shortcutInterceptionEnabled', false);
            
            updateButtonShortcuts();
            
            const inputs = document.querySelectorAll('.shortcut-item-input');
            inputs.forEach((input) => {
                const typeName = input.dataset.typeName;
                const originalKey = platformOriginalShortcuts[typeName];
                if (originalKey) {
                    input.value = originalKey.toUpperCase();
                    input.dataset.newKey = originalKey;
                }
            });
            
            alert('✅ 所有快捷键已重置为平台原始值，快捷键拦截已停止。\n\n如需重新启用，请刷新页面或重新保存快捷键配置。');
            console.log('✅ 所有快捷键已重置为平台原始值，快捷键拦截已停止');
        }
    }

    function updateButtonShortcuts() {
        const typeButtons = document.querySelectorAll('.gk-detail-types button[ng-repeat="type in types"]');
        
        typeButtons.forEach((button) => {
            const strongEl = button.querySelector('strong');
            if (!strongEl) return;
            
            const fullText = button.textContent.trim();
            const nameMatch = fullText.match(/\[.+?\]\s*(.+)/);
            const typeName = nameMatch ? nameMatch[1].trim() : '未知标签';
            
            const currentKey = shortcutMapping[typeName];
            
            if (currentKey) {
                strongEl.textContent = `[${currentKey.toUpperCase()}]`;
            }
        });
    }

    function savePlatformOriginalShortcuts() {
        const savedOriginals = GM_getValue('platformOriginalShortcuts', null);
        
        if (savedOriginals && Object.keys(savedOriginals).length > 0) {
            platformOriginalShortcuts = savedOriginals;
            console.log('✅ 已加载保存的平台原始快捷键');
            return;
        }
        
        const typeButtons = document.querySelectorAll('.gk-detail-types button[ng-repeat="type in types"]');
        
        if (typeButtons.length === 0) {
            console.log('⚠️ 未找到标签按钮，稍后重试保存平台原始快捷键');
            setTimeout(savePlatformOriginalShortcuts, 1000);
            return;
        }
        
        platformOriginalShortcuts = {};
        
        typeButtons.forEach((button) => {
            const strongEl = button.querySelector('strong');
            if (!strongEl) return;
            
            const fullText = button.textContent.trim();
            const nameMatch = fullText.match(/\[.+?\]\s*(.+)/);
            const typeName = nameMatch ? nameMatch[1].trim() : '未知标签';
            
            const shortcutText = strongEl.textContent.trim();
            const match = shortcutText.match(/\[(.+?)\]/);
            const originalKey = match ? match[1].toLowerCase() : '';
            
            platformOriginalShortcuts[typeName] = originalKey;
        });
        
        GM_setValue('platformOriginalShortcuts', platformOriginalShortcuts);
        console.log('✅ 已保存平台原始快捷键:', platformOriginalShortcuts);
    }

    function initShortcutEditor() {
        document.addEventListener('keydown', (e) => {
            if (checkShortcut(e, 'k')) {
                e.preventDefault();
                const activeElement = document.activeElement;
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    return;
                }
                
                openShortcutModal();
                return;
            }
            
            if (!shortcutInterceptionEnabled) {
                return;
            }
            
            if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                return;
            }
            
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT') {
                return;
            }
            
            const modal = document.getElementById('shortcut-modal-overlay');
            if (modal && modal.classList.contains('active')) {
                return;
            }
            
            const pressedKey = e.key.toLowerCase();
            
            const typeButtons = document.querySelectorAll('.gk-detail-types button[ng-repeat="type in types"]');
            let targetButton = null;
            let foundMapping = false;
            
            typeButtons.forEach((button) => {
                const strongEl = button.querySelector('strong');
                if (!strongEl) return;
                
                const fullText = button.textContent.trim();
                const nameMatch = fullText.match(/\[.+?\]\s*(.+)/);
                const typeName = nameMatch ? nameMatch[1].trim() : '未知标签';
                
                const mappedKey = shortcutMapping[typeName];
                
                if (mappedKey && mappedKey.toLowerCase() === pressedKey) {
                    targetButton = button;
                    foundMapping = true;
                }
            });
            
            if (foundMapping && targetButton) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                targetButton.click();
                
                console.log(`⌨️ 快捷键 "${pressedKey.toUpperCase()}" 已触发标签切换`);
                
                return false;
            }
        }, true);
        
        savePlatformOriginalShortcuts();
        updateButtonShortcuts();
        
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('gk-detail-types')) {
                                shouldUpdate = true;
                            } else if (node.querySelector && node.querySelector('.gk-detail-types')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => {
                    updateButtonShortcuts();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('⌨️ 快捷键修改功能已启用（按 Ctrl+Shift+Alt+K 打开设置）');
    }

    let labelDisplayEnabled = GM_getValue('labelDisplayEnabled', true);
    let globalCategoryColorMap = new Map();
    let currentLabelRequest = null;
    let lastPicid = '';
    let labelMutationTimeout = null;

    const CATEGORY_CACHE_KEY = 'label-category-cache';
    const LABELS_CACHE_KEY_PREFIX = 'label-labels-cache-';
    const CATEGORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
    const LABELS_CACHE_EXPIRY = 12 * 60 * 60 * 1000;

    function createLabelContainer() {
        const targetDiv = document.querySelector('.gk-detail-main');
        if (!targetDiv) return null;
        
        let container = document.getElementById('label-list-container');
        if (container) return container;
        
        container = document.createElement('div');
        container.id = 'label-list-container';
        container.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid var(--primary-color);
            border-radius: 6px;
            padding: 15px;
            z-index: 999999;
            max-height: 70vh;
            overflow-y: auto;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            min-width: 250px;
            pointer-events: auto;
            transition: all 0.3s ease;
            display: ${labelDisplayEnabled ? 'block' : 'none'};
        `;
        
        if (window.getComputedStyle(targetDiv).position === 'static') {
            targetDiv.style.position = 'relative';
        }
        
        targetDiv.appendChild(container);
        return container;
    }

    function fetchCategoryData() {
        return new Promise((resolve, reject) => {
            const cachedData = localStorage.getItem(CATEGORY_CACHE_KEY);
            if (cachedData) {
                try {
                    const cache = JSON.parse(cachedData);
                    const now = Date.now();
                    
                    if (now - cache.timestamp < CATEGORY_CACHE_EXPIRY) {
                        const categoryColorMap = new Map();
                        cache.data.forEach(category => {
                            if (category.typeid && category.color) {
                                categoryColorMap.set(String(category.typeid), category.color);
                            }
                        });
                        resolve(categoryColorMap);
                        return;
                    }
                } catch (error) {
                    console.error('解析缓存数据失败:', error);
                    localStorage.removeItem(CATEGORY_CACHE_KEY);
                }
            }
            
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'http://10.212.80.215:8901/api/marking/listtype',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: JSON.stringify({ sort: 'typeid' }),
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        
                        if (data.errno === 0 && data.msg === 'success') {
                            const categoryColorMap = new Map();
                            data.data.forEach(category => {
                                if (category.typeid && category.color) {
                                    categoryColorMap.set(String(category.typeid), category.color);
                                }
                            });
                            
                            const cacheData = {
                                timestamp: Date.now(),
                                data: data.data
                            };
                            localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(cacheData));
                            
                            resolve(categoryColorMap);
                        } else {
                            localStorage.removeItem(CATEGORY_CACHE_KEY);
                            reject(new Error('类别API返回错误: ' + data.msg));
                        }
                    } catch (error) {
                        localStorage.removeItem(CATEGORY_CACHE_KEY);
                        reject(error);
                    }
                },
                onerror: function(error) {
                    localStorage.removeItem(CATEGORY_CACHE_KEY);
                    reject(error);
                }
            });
        });
    }

    function findPicid() {
        const activeLi = document.querySelector('.gk-detail-pics li.active');
        if (activeLi) {
            const span = activeLi.querySelector('span.fl');
            if (span) {
                const picid = span.textContent.trim();
                if (picid) return picid;
            }
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        let picid = urlParams.get('picid');
        if (picid) return picid;
        
        picid = urlParams.get('id');
        if (picid) return picid;
        
        const imgElements = document.querySelectorAll('img');
        for (let img of imgElements) {
            const src = img.src;
            if (src.includes('object_id=')) {
                const objectIdMatch = src.match(/object_id=([^&]+)/);
                if (objectIdMatch && objectIdMatch[1]) {
                    return objectIdMatch[1];
                }
            }
        }
        
        const allLis = document.querySelectorAll('.gk-detail-pics li');
        for (let li of allLis) {
            const span = li.querySelector('span.fl');
            if (span) {
                picid = span.textContent.trim();
                if (picid) return picid;
            }
        }
        
        return null;
    }

    function fetchLabels(picid) {
        removeHighlightBox();
        
        if (currentLabelRequest) {
            currentLabelRequest.abort();
            currentLabelRequest = null;
        }
        
        const cacheKey = `${LABELS_CACHE_KEY_PREFIX}${picid}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                const cache = JSON.parse(cachedData);
                const now = Date.now();
                
                if (now - cache.timestamp < LABELS_CACHE_EXPIRY) {
                    displayLabels(cache.data);
                    return;
                }
            } catch (error) {
                console.error('解析标签缓存数据失败:', error);
                localStorage.removeItem(cacheKey);
            }
        }
        
        showLoading();
        
        currentLabelRequest = GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://10.212.80.215:8901/api/marking/listlabel',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: JSON.stringify({ picid: picid }),
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    
                    if (data.errno === 0 && data.msg === 'success') {
                        const cacheData = {
                            timestamp: Date.now(),
                            data: data.data
                        };
                        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                        
                        displayLabels(data.data);
                    } else {
                        localStorage.removeItem(cacheKey);
                        showError('API返回错误: ' + data.msg);
                    }
                } catch (error) {
                    localStorage.removeItem(cacheKey);
                    showError('解析数据失败');
                } finally {
                    currentLabelRequest = null;
                }
            },
            onerror: function(error) {
                localStorage.removeItem(cacheKey);
                showError('请求API失败');
                currentLabelRequest = null;
            }
        });
    }

    function displayLabels(data) {
        const categoryColorMap = globalCategoryColorMap;
        const container = document.getElementById('label-list-container') || createLabelContainer();
        if (!container) return;
        
        container.innerHTML = '';
        
        let labels = [];
        if (Array.isArray(data)) {
            labels = data;
        } else if (data && Array.isArray(data.data)) {
            labels = data.data;
        } else {
            const noLabelsDiv = document.createElement('div');
            noLabelsDiv.style.cssText = `
                padding: 20px;
                text-align: center;
                color: #999;
                font-style: italic;
            `;
            noLabelsDiv.textContent = '没有找到标签数据';
            container.appendChild(noLabelsDiv);
            return;
        }
        
        const headerContainer = document.createElement('div');
        headerContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        `;
        
        const title = document.createElement('h3');
        title.textContent = '标签列表';
        title.style.cssText = `
            margin: 0;
            color: var(--text-primary);
            font-size: 16px;
            font-weight: bold;
        `;
        headerContainer.appendChild(title);
        
        const countDiv = document.createElement('div');
        countDiv.style.cssText = `
            font-size: 12px;
            color: var(--text-secondary);
            margin: 0;
        `;
        countDiv.textContent = `共 ${labels.length} 个`;
        headerContainer.appendChild(countDiv);
        
        container.appendChild(headerContainer);
        
        const pageTexts = getPageTextContents();
        
        labels.forEach((label, index) => {
            const labelItem = document.createElement('div');
            labelItem.style.cssText = `
                padding: 8px 10px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--text-primary);
                display: flex;
                align-items: center;
            `;
            
            let labelName = '未知标签';
            let labelType = '';
            if (typeof label === 'string') {
                labelName = label;
            } else if (label && typeof label === 'object') {
                labelName = label.name || label.label || label.title || label.text || '未知标签';
                labelType = String(label.type || label.typeid || label.category_id || '');
            }
            
            const isMatch = pageTexts.has(labelName);
            
            const textContainer = document.createElement('span');
            textContainer.textContent = `${index + 1}. ${labelName}`;
            textContainer.style.cssText = `
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s ease;
                display: inline-block;
            `;
            
            if (labelType) {
                let color = categoryColorMap.get(labelType);
                
                if (!color && labelType.length > 3) {
                    const shortType = labelType.substring(0, 3);
                    color = categoryColorMap.get(shortType);
                }
                
                if (color) {
                    textContainer.style.background = color;
                    textContainer.style.color = '#fff';
                    textContainer.style.textShadow = '0 1px 1px rgba(0,0,0,0.3)';
                } else if (isMatch) {
                    textContainer.style.color = 'red';
                    textContainer.style.fontWeight = 'bold';
                }
            } else if (isMatch) {
                textContainer.style.color = 'red';
                textContainer.style.fontWeight = 'bold';
            }
            
            labelItem.addEventListener('mouseover', function() {
                this.style.background = 'var(--bg-tertiary)';
            });
            
            labelItem.addEventListener('mouseout', function() {
                this.style.background = 'transparent';
            });
            
            let labelBgColor = '';
            let labelPoints = null;
            
            if (labelType) {
                const color = categoryColorMap.get(labelType);
                if (color) {
                    labelBgColor = color;
                }
            }
            
            if (label.locate && label.locate.points && label.locate.points.length >= 3) {
                labelPoints = label.locate.points;
            }
            
            labelItem.addEventListener('mouseenter', function() {
                if (labelPoints) {
                    drawHighlightBox(labelPoints, labelBgColor);
                }
            });
            
            labelItem.addEventListener('mouseleave', function() {
                removeHighlightBox();
            });
            
            labelItem.appendChild(textContainer);
            container.appendChild(labelItem);
        });
    }

    function getPageTextContents() {
        const texts = new Set();
        const textElements = document.querySelectorAll('text');
        
        textElements.forEach(element => {
            const content = element.textContent.trim();
            if (content) {
                texts.add(content);
            }
        });
        
        return texts;
    }

    function showLoading() {
        const container = document.getElementById('label-list-container') || createLabelContainer();
        if (container) {
            container.innerHTML = `
                <h3 style="margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #eee; color: var(--text-primary); font-size: 16px;">标签列表</h3>
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--primary-color); border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <div style="margin-top: 10px;">加载中...</div>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
        }
    }

    function showError(message) {
        const container = document.getElementById('label-list-container') || createLabelContainer();
        if (container) {
            container.innerHTML = `<h3 style="color: red;">错误</h3><p>${message}</p>`;
        }
    }

    function drawHighlightBox(points, backgroundColor) {
        const svg = document.getElementById('j-svg');
        if (!svg) return;
        
        if (!points || points.length < 3) return;
        
        if (!backgroundColor) {
            backgroundColor = '#FF0000';
        }
        
        const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');
        if (validPoints.length < 3) return;
        
        const insetPixels = 15;
        
        const centerX = validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
        const centerY = validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;
        
        const insetPoints = validPoints.map(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 1) return { x: p.x, y: p.y };
            
            const scale = (distance - insetPixels) / distance;
            return {
                x: centerX + dx * scale,
                y: centerY + dy * scale
            };
        });
        
        let rect;
        try {
            rect = svg.getBoundingClientRect();
        } catch (e) {
            console.warn('⚠️ 获取SVG边界失败:', e);
            return;
        }
        
        if (!rect || typeof rect.top !== 'number') {
            console.warn('⚠️ SVG边界数据无效');
            return;
        }
        
        const viewBox = svg.viewBox ? svg.viewBox.baseVal : null;
        const scaleX = viewBox && rect.width > 0 ? viewBox.width / rect.width : 1;
        const scaleY = viewBox && rect.height > 0 ? viewBox.height / rect.height : 1;
        
        const clientInsetPoints = insetPoints.map(p => ({
            x: (p.x / scaleX),
            y: (p.y / scaleY)
        }));
        
        const polygonPath = clientInsetPoints.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';
        
        const container = svg.parentElement;
        const existingOverlay = document.getElementById('highlight-overlay-div');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlayDiv = document.createElement('div');
        overlayDiv.id = 'highlight-overlay-div';
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const overlayWidth = Math.min(rect.width, windowWidth - rect.left);
        const overlayHeight = Math.min(rect.height, windowHeight - rect.top);
        
        overlayDiv.style.cssText = `
            position: absolute;
            top: ${rect.top + window.scrollY}px;
            left: ${rect.left + window.scrollX}px;
            width: ${overlayWidth}px;
            height: ${overlayHeight}px;
            pointer-events: none;
            z-index: 9998;
            overflow: hidden;
            box-sizing: border-box;
        `;
        
        const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgOverlay.setAttribute('width', overlayWidth);
        svgOverlay.setAttribute('height', overlayHeight);
        svgOverlay.setAttribute('style', 'position: absolute; top: 0; left: 0; overflow: hidden;');
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', 'highlight-clip-path-' + Date.now());
        const clipPathPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        clipPathPath.setAttribute('d', polygonPath);
        clipPath.appendChild(clipPathPath);
        defs.appendChild(clipPath);
        
        svgOverlay.appendChild(defs);
        
        const grayRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        grayRect.setAttribute('width', overlayWidth);
        grayRect.setAttribute('height', overlayHeight);
        grayRect.setAttribute('fill', 'rgba(50, 50, 50, 0.55)');
        grayRect.setAttribute('clip-path', `url(#${clipPath.getAttribute('id')})`);
        svgOverlay.appendChild(grayRect);
        
        overlayDiv.appendChild(svgOverlay);
        document.body.appendChild(overlayDiv);
        
        const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
        
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = 'highlight-box';
        group.setAttribute('style', 'pointer-events: none;');
        
        const groupDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        const glowFilterId = 'glow-filter-' + Date.now();
        glowFilter.setAttribute('id', glowFilterId);
        glowFilter.setAttribute('x', '-150%');
        glowFilter.setAttribute('y', '-150%');
        glowFilter.setAttribute('width', '400%');
        glowFilter.setAttribute('height', '400%');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '15');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        glowFilter.appendChild(feGaussianBlur);
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        feMerge.appendChild(feMergeNode1);
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode2);
        glowFilter.appendChild(feMerge);
        groupDefs.appendChild(glowFilter);
        
        const strongGlowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        const strongGlowId = 'strong-glow-' + Date.now();
        strongGlowFilter.setAttribute('id', strongGlowId);
        strongGlowFilter.setAttribute('x', '-200%');
        strongGlowFilter.setAttribute('y', '-200%');
        strongGlowFilter.setAttribute('width', '500%');
        strongGlowFilter.setAttribute('height', '500%');
        
        const feStrongBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feStrongBlur.setAttribute('stdDeviation', '25');
        feStrongBlur.setAttribute('result', 'strongBlur');
        strongGlowFilter.appendChild(feStrongBlur);
        
        const feStrongMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feStrongMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feStrongMergeNode1.setAttribute('in', 'strongBlur');
        feStrongMerge.appendChild(feStrongMergeNode1);
        const feStrongMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feStrongMergeNode2.setAttribute('in', 'SourceGraphic');
        feStrongMerge.appendChild(feStrongMergeNode2);
        strongGlowFilter.appendChild(feStrongMerge);
        groupDefs.appendChild(strongGlowFilter);
        
        group.appendChild(groupDefs);
        
        const outerGlowStroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        outerGlowStroke.setAttribute('points', pointsStr);
        outerGlowStroke.setAttribute('fill', 'none');
        outerGlowStroke.setAttribute('stroke', backgroundColor);
        outerGlowStroke.setAttribute('stroke-width', '25');
        outerGlowStroke.setAttribute('opacity', '0.6');
        outerGlowStroke.setAttribute('stroke-linejoin', 'round');
        outerGlowStroke.setAttribute('filter', `url(#${strongGlowId})`);
        group.appendChild(outerGlowStroke);
        
        const middleGlowStroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        middleGlowStroke.setAttribute('points', pointsStr);
        middleGlowStroke.setAttribute('fill', 'none');
        middleGlowStroke.setAttribute('stroke', backgroundColor);
        middleGlowStroke.setAttribute('stroke-width', '15');
        middleGlowStroke.setAttribute('opacity', '0.8');
        middleGlowStroke.setAttribute('stroke-linejoin', 'round');
        middleGlowStroke.setAttribute('filter', `url(#${glowFilterId})`);
        group.appendChild(middleGlowStroke);
        
        const mainStroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        mainStroke.setAttribute('points', pointsStr);
        mainStroke.setAttribute('fill', 'none');
        mainStroke.setAttribute('stroke', backgroundColor);
        mainStroke.setAttribute('stroke-width', '6');
        mainStroke.setAttribute('stroke-linejoin', 'round');
        mainStroke.setAttribute('opacity', '1');
        group.appendChild(mainStroke);
        
        const innerWhiteStroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        innerWhiteStroke.setAttribute('points', pointsStr);
        innerWhiteStroke.setAttribute('fill', 'none');
        innerWhiteStroke.setAttribute('stroke', '#ffffff');
        innerWhiteStroke.setAttribute('stroke-width', '2');
        innerWhiteStroke.setAttribute('stroke-linejoin', 'round');
        innerWhiteStroke.setAttribute('opacity', '0.9');
        group.appendChild(innerWhiteStroke);
        
        svg.appendChild(group);
    }

    function removeHighlightBox() {
        const highlightBox = document.getElementById('highlight-box');
        if (highlightBox) {
            highlightBox.remove();
        }
        const grayOverlay = document.getElementById('highlight-gray-overlay');
        if (grayOverlay) {
            grayOverlay.remove();
        }
        const overlayDiv = document.getElementById('highlight-overlay-div');
        if (overlayDiv) {
            overlayDiv.remove();
        }
    }

    function setupLabelMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            if (!labelDisplayEnabled) return;
            
            const hasRelevantChanges = mutations.some(mutation => {
                return mutation.target.closest('.gk-detail-pics') || 
                       Array.from(mutation.addedNodes).some(node => node.closest && node.closest('.gk-detail-pics'));
            });
            
            if (hasRelevantChanges) {
                if (labelMutationTimeout) {
                    clearTimeout(labelMutationTimeout);
                }
                
                labelMutationTimeout = setTimeout(() => {
                    const picid = findPicid();
                    if (picid && picid !== lastPicid) {
                        lastPicid = picid;
                        fetchLabels(picid);
                    }
                }, 200);
            }
        });
        
        const gkDetailPics = document.querySelector('.gk-detail-pics');
        if (gkDetailPics) {
            observer.observe(gkDetailPics, {
                childList: true,
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    function setupLiClickListeners() {
        const ul = document.querySelector('.gk-detail-pics');
        if (!ul) return;
        
        ul.addEventListener('click', function(event) {
            if (!labelDisplayEnabled) return;
            
            const li = event.target.closest('li');
            if (li) {
                const span = li.querySelector('.fl');
                if (span) {
                    const picid = span.textContent.trim();
                    if (picid) {
                        fetchLabels(picid);
                    }
                }
            }
        });
    }

    function initLabelDisplay() {
        document.addEventListener('keydown', (e) => {
            if (checkShortcut(e, 'l')) {
                e.preventDefault();
                
                labelDisplayEnabled = !labelDisplayEnabled;
                GM_setValue('labelDisplayEnabled', labelDisplayEnabled);
                
                const container = document.getElementById('label-list-container');
                if (container) {
                    container.style.display = labelDisplayEnabled ? 'block' : 'none';
                }
                
                console.log(`🏷️ 标签显示已${labelDisplayEnabled ? '开启' : '关闭'}`);
            }
        });
        
        createLabelContainer();
        
        fetchCategoryData()
            .then(categoryColorMap => {
                globalCategoryColorMap = categoryColorMap;
                
                let pollCount = 0;
                const maxPollCount = 10;
                const pollInterval = 300;
                
                function pollForPicid() {
                    pollCount++;
                    
                    const picid = findPicid();
                    if (picid) {
                        lastPicid = picid;
                        if (labelDisplayEnabled) {
                            fetchLabels(picid);
                        }
                    } else if (pollCount < maxPollCount) {
                        setTimeout(pollForPicid, pollInterval);
                    }
                }
                
                pollForPicid();
            })
            .catch(error => {
                console.error('获取类别数据失败:', error);
            });
        
        setupLabelMutationObserver();
        setupLiClickListeners();
        
        console.log('🏷️ 标签显示功能已启用（按 Ctrl+Shift+Alt+L 切换）');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createThemeSelector();
            addSVIPIcon();
            addTimeDisplay();
            createCrosshair();
            initRightClickDrag();
            initAutoSquare();
            initShortcutEditor();
            initLabelDisplay();
        });
    } else {
        createThemeSelector();
        addSVIPIcon();
        addTimeDisplay();
        createCrosshair();
        initRightClickDrag();
        initAutoSquare();
        initShortcutEditor();
        initLabelDisplay();
    }

    console.log('✨ 样本标注系统增强工具已加载！');
    console.log('🎨 当前主题：', currentTheme, themes[currentTheme].name);
    console.log('💻 当前平台：', isMacPlatform ? 'Mac/iOS (Cmd+Shift+Ctrl)' : 'Windows (Ctrl+Shift+Alt)');
    console.log('🎯 十字参考线：按 ' + modifiers.combo + '+P 切换');
    console.log('🖱️ 右键拖动：右键拖动图片，按 C/X/A 键重置位置');
    console.log('📦 自动正方形：双击画框时自动创建100x100正方形');
    console.log('⌨️ 快捷键设置：按 ' + modifiers.combo + '+K 打开设置');
    console.log('🏷️ 标签显示：按 ' + modifiers.combo + '+L 切换');
    console.log('🔄 检查更新：按 ' + modifiers.combo + '+U 手动检查');
    
    initAutoUpdate();
})();

function initAutoUpdate() {
    const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;
    const UPDATE_JSON_URL = 'https://raw.githubusercontent.com/kirito10010/baidu-mark/master/update.json';
    
    function compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        const length = Math.max(parts1.length, parts2.length);
        
        for (let i = 0; i < length; i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }
    
    function showUpdateNotification(version, changelog, downloadUrl) {
        const existingNotification = document.getElementById('update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 99999;
            font-size: 14px;
            max-width: 320px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                #update-notification .update-title { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
                #update-notification .update-changelog { margin-bottom: 12px; opacity: 0.9; white-space: pre-line; }
                #update-notification .update-btn {
                    display: inline-block;
                    background: white;
                    color: #667eea;
                    padding: 6px 16px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                #update-notification .update-btn:hover {
                    background: #f0f0f0;
                    transform: translateY(-1px);
                }
                #update-notification .update-close {
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.8;
                }
                #update-notification .update-close:hover { opacity: 1; }
            </style>
            <div class="update-title">🚀 插件更新可用！</div>
            <div class="update-changelog">版本 v${version} 已发布：\n${changelog}</div>
            <button class="update-btn">立即更新</button>
            <div class="update-close">×</div>
        `;
        
        notification.querySelector('.update-btn').addEventListener('click', () => {
            const url = downloadUrl || 'https://raw.githubusercontent.com/kirito10010/baidu-mark/master/lijin-baidu-mark.user.js';
            GM_openInTab(url, { active: true });
        });
        
        notification.querySelector('.update-close').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            const notif = document.getElementById('update-notification');
            if (notif) notif.remove();
        }, 15000);
    }
    
    function checkForUpdates(showNoUpdate = false) {
        let currentVersion = '6.1.0';
        if (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) {
            currentVersion = GM_info.script.version;
        } else {
            const script = document.querySelector('script[src*="baidu-mark"]');
            if (script) {
                const match = script.src.match(/v(\d+\.\d+\.\d+)/);
                if (match) currentVersion = match[1];
            }
        }
        console.log(`🔍 检查更新 - 当前版本: ${currentVersion}`);
        
        try {
            GM_xmlhttpRequest({
                method: 'GET',
                url: UPDATE_JSON_URL + '?t=' + Date.now(),
                timeout: 10000,
                onload: function(response) {
                    try {
                        console.log(`📥 收到更新数据: ${response.responseText.substring(0, 100)}...`);
                        const updateData = JSON.parse(response.responseText);
                        
                        if (!updateData.version) {
                            console.log('❌ 更新检查失败：未找到版本信息');
                            return;
                        }
                        
                        console.log(`📊 当前版本: ${currentVersion}, 最新版本: ${updateData.version}`);
                        const comparison = compareVersions(currentVersion, updateData.version);
                        console.log(`📈 版本比较结果: ${comparison}`);
                        
                        if (comparison < 0) {
                            console.log(`🔄 发现新版本：${updateData.version}`);
                            showUpdateNotification(updateData.version, updateData.changelog || '', updateData.downloadUrl);
                        } else if (showNoUpdate) {
                            console.log('✅ 当前已是最新版本');
                        } else {
                            console.log('✅ 当前已是最新版本');
                        }
                    } catch (e) {
                        console.log('❌ 更新检查失败：解析数据错误', e);
                    }
                },
                onerror: function(error) {
                    console.log('❌ 更新检查失败：网络错误', error);
                }
            });
        } catch (e) {
            console.log('❌ 更新检查失败', e);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (checkShortcut(e, 'u')) {
            e.preventDefault();
            checkForUpdates(true);
        }
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForUpdates);
    } else {
        checkForUpdates();
    }
}
