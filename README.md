# WebGPU Chat with Phi-3

A powerful, browser-based chat application that runs the Phi-3 language model locally using WebGPU acceleration. This application demonstrates the capabilities of running large language models directly in the browser without requiring a server for inference.

## Features

- **WebGPU Acceleration**: Utilizes your GPU for fast model inference
- **Privacy-First**: All processing happens locally in your browser
- **Efficient Caching**: Model files are cached for faster subsequent loads
- **Modern UI**: Clean, responsive design with dark mode support
- **Real-Time Streaming**: See responses as they're generated
- **Markdown Support**: Rich text formatting in messages
- **Loading Indicators**: Visual progress tracking for model loading

## Prerequisites

- A WebGPU-capable browser (e.g., Chrome Canary with appropriate flags enabled)
- Sufficient GPU memory for model inference
- Modern hardware that supports WebGPU

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/beekmarks/vanillajs-webgpu-chat
   cd webgpu-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Technology Stack

- **Vite**: Fast, modern build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Transformers.js**: Hugging Face's machine learning library for JavaScript
- **Marked**: Markdown parsing
- **DOMPurify**: Security-focused HTML sanitization

## Model Information

This application uses the Phi-3-mini-4k-instruct model, which is:
- A 3.82 billion parameter LLM
- Optimized for web inference
- Approximately 2.3GB in size
- Cached locally after first load

## Browser Compatibility

The application requires WebGPU support. Currently, this means:
- Chrome Canary with WebGPU flags enabled
- Other browsers with experimental WebGPU support

To enable WebGPU in Chrome Canary:
1. Navigate to `chrome://flags`
2. Enable "WebGPU Developer Features"
3. Restart the browser

## Project Structure

```
webgpu-chat/
├── index.html              # Main HTML file
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── public/               # Public assets
├── src/
│   ├── index.css         # Styles
│   ├── main.js           # Main JavaScript entry point
│   └── worker.js         # Web Worker for model operations
├── tailwind.config.js    # Tailwind configuration
└── vite.config.js        # Vite configuration
```

## Development

The application uses a vanilla JavaScript architecture with:
- Web Workers for non-blocking model operations
- Event-driven communication between UI and worker
- Modular class-based structure
- Tailwind CSS for styling

## Security

- All processing happens locally in the browser
- No data is sent to external servers
- HTML sanitization for markdown rendering
- Secure content policies for worker execution

## Acknowledgments

- Hugging Face for the Transformers.js library
- Microsoft for the Phi-3 model
- The WebGPU working group

