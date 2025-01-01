import './index.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
const STICKY_SCROLL_THRESHOLD = 120;

class ChatApp {
    constructor() {
        this.worker = null;
        this.messages = [];
        this.isRunning = false;
        this.tps = null;
        this.numTokens = null;
        this.progressItems = new Map();
        
        // DOM Elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.chatMessages = document.getElementById('chat-messages');
        this.inputContainer = document.getElementById('input-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.stopButton = document.getElementById('stop-generate');
        this.loadButton = document.getElementById('load-model');
        this.loadingStatus = document.getElementById('loading-status');
        this.loadingMessage = document.getElementById('loading-message');
        this.progressContainer = document.getElementById('progress-container');
        
        this.initializeEventListeners();
        this.initializeWorker();
    }

    initializeEventListeners() {
        this.loadButton?.addEventListener('click', () => {
            this.worker.postMessage({ type: 'load' });
            this.loadButton.disabled = true;
            this.loadingStatus.classList.remove('hidden');
        });

        this.chatInput?.addEventListener('input', this.resizeInput.bind(this));
        
        this.sendButton?.addEventListener('click', () => this.onSend());
        
        this.stopButton?.addEventListener('click', () => this.onInterrupt());
        
        this.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.onSend();
            }
        });
    }

    initializeWorker() {
        if (!this.worker) {
            this.worker = new Worker(new URL('./worker.js', import.meta.url), {
                type: 'module'
            });
        }

        this.worker.addEventListener('message', this.onMessageReceived.bind(this));
    }

    onMessageReceived(e) {
        switch (e.data.status) {
            case 'loading':
                this.updateLoadingStatus(e.data.data);
                break;
            case 'initiate':
                this.addProgressItem(e.data);
                break;
            case 'progress':
                this.updateProgressItem(e.data);
                break;
            case 'done':
                this.removeProgressItem(e.data.file);
                break;
            case 'ready':
                this.onModelReady();
                break;
            case 'start':
                this.onGenerationStart();
                break;
            case 'update':
                this.onGenerationUpdate(e.data);
                break;
            case 'complete':
                this.onGenerationComplete();
                break;
        }
    }

    updateLoadingStatus(message) {
        if (this.loadingMessage) {
            this.loadingMessage.textContent = message;
        }
    }

    addProgressItem(data) {
        const progressId = `progress-${data.file}`;
        if (!this.progressItems.has(data.file)) {
            const progressElement = document.createElement('div');
            progressElement.className = 'flex flex-col';
            progressElement.innerHTML = `
                <div class="flex justify-between text-sm">
                    <span>${data.file}</span>
                    <span class="progress-percent">0%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                </div>
            `;
            this.progressContainer?.appendChild(progressElement);
            this.progressItems.set(data.file, progressElement);
        }
    }

    updateProgressItem(data) {
        const progressElement = this.progressItems.get(data.file);
        if (progressElement) {
            const percent = Math.round((data.loaded / data.total) * 100);
            const progressBar = progressElement.querySelector('.bg-blue-600');
            const percentText = progressElement.querySelector('.progress-percent');
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (percentText) percentText.textContent = `${percent}%`;
        }
    }

    removeProgressItem(file) {
        const progressElement = this.progressItems.get(file);
        if (progressElement) {
            progressElement.remove();
            this.progressItems.delete(file);
        }
    }

    onModelReady() {
        this.loadingStatus?.classList.add('hidden');
        this.welcomeScreen?.classList.add('hidden');
        this.chatMessages?.classList.remove('hidden');
        this.inputContainer?.classList.remove('hidden');
    }

    onGenerationStart() {
        this.messages.push({ role: 'assistant', content: '' });
        this.renderMessages();
    }

    onGenerationUpdate({ output, tps, numTokens }) {
        this.tps = tps;
        this.numTokens = numTokens;
        const lastMessage = this.messages[this.messages.length - 1];
        lastMessage.content += output;
        this.renderMessages();
        this.scrollToBottom();
    }

    onGenerationComplete() {
        this.isRunning = false;
        this.stopButton?.classList.add('hidden');
        this.sendButton?.classList.remove('hidden');
        this.chatInput.disabled = false;
    }

    onSend() {
        const message = this.chatInput.value.trim();
        if (!message || this.isRunning) return;

        this.messages.push({ role: 'user', content: message });
        this.chatInput.value = '';
        this.resizeInput();
        this.isRunning = true;
        this.tps = null;
        
        this.renderMessages();
        this.worker.postMessage({ type: 'generate', data: this.messages });
        
        this.stopButton?.classList.remove('hidden');
        this.sendButton?.classList.add('hidden');
        this.chatInput.disabled = true;
    }

    onInterrupt() {
        this.worker.postMessage({ type: 'interrupt' });
    }

    resizeInput() {
        if (!this.chatInput) return;
        this.chatInput.style.height = 'auto';
        const newHeight = Math.min(Math.max(this.chatInput.scrollHeight, 24), 200);
        this.chatInput.style.height = `${newHeight}px`;
    }

    renderMessages() {
        if (!this.chatMessages) return;
        
        this.chatMessages.innerHTML = this.messages.map((message, index) => `
            <div class="message ${message.role} mb-4">
                <div class="font-bold mb-1">${message.role === 'user' ? 'You' : 'Assistant'}</div>
                <div class="message-content">${DOMPurify.sanitize(marked.parse(message.content))}</div>
            </div>
        `).join('');
    }

    scrollToBottom() {
        if (!this.chatMessages) return;
        if (this.isRunning && 
            this.chatMessages.scrollHeight - this.chatMessages.scrollTop - this.chatMessages.clientHeight < STICKY_SCROLL_THRESHOLD) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Only initialize if WebGPU is available
if (IS_WEBGPU_AVAILABLE) {
    new ChatApp();
} else {
    document.getElementById('app').innerHTML = `
        <div class="h-full flex items-center justify-center p-4">
            <div class="max-w-md text-center">
                <h1 class="text-2xl font-bold mb-4">WebGPU Not Available</h1>
                <p>Your browser doesn't support WebGPU. Please use a compatible browser like Chrome Canary with the appropriate flags enabled.</p>
            </div>
        </div>
    `;
}
