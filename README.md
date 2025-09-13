# Visual API Flow

Node-based visual API testing tool combining the power of Postman, the flexibility of Figma, and the visual workflow of Rete.js.

## 🚀 Features

- **Node-based Visual Interface**: Drag and drop API requests and responses like in Blender or Unreal Engine
- **HTTP Request Nodes**: Configure GET, POST, PUT, DELETE, PATCH requests with full control
- **Response Handler Nodes**: Extract data, validate responses, and chain requests
- **Real-time Execution**: Execute flows and see results in real-time
- **Visual Feedback**: Status indicators, error highlighting, and response preview
- **Chain Requests**: Connect API calls to create complex testing workflows

## 🛠 Tech Stack

- **Frontend**: React + Vite
- **Node Editor**: Rete.js v2
- **HTTP Client**: Axios
- **Styling**: CSS + Styled Components

## 📦 Installation

```bash
# Navigate to project directory
cd visual-api-flow

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

## 🎮 Usage

### Basic Workflow

1. **Add HTTP Request Node**: Click the "+ HTTP Request" button
   - Configure method (GET, POST, PUT, DELETE, PATCH)
   - Set URL endpoint
   - Add headers (JSON format)
   - Add request body (for POST/PUT/PATCH)

2. **Add Response Handler Node**: Click the "+ Response Handler" button
   - Set extraction path (e.g., `data.users[0].name`)
   - Configure expected status code
   - Add custom validation (JavaScript expression)

3. **Connect Nodes**: Drag from output socket to input socket
   - Connect HTTP Request "Response" to Response Handler "Response"

4. **Execute Flow**: Click "▶ Execute Flow" to run all connected nodes

### Example Flow

```
[HTTP Request] → [Response Handler] → [Another HTTP Request]
     ↓                  ↓                      ↓
  GET /users      Extract user.id         POST /users/123/posts
```

### Node Types

#### HTTP Request Node
- **Inputs**: Trigger, URL, Method, Headers, Body
- **Outputs**: Response
- **Features**: 
  - Visual status indicators (idle, loading, success, error)
  - Response preview
  - Full HTTP method support
  - Custom headers and body

#### Response Handler Node
- **Inputs**: Response
- **Outputs**: Extracted Data, Is Valid, Status Code, Headers
- **Features**:
  - JSONPath-like data extraction
  - Status code validation
  - Custom JavaScript validation expressions
  - Visual validation indicators

## 🎯 Use Cases

- **API Testing Workflows**: Create complex test scenarios with dependent requests
- **Data Pipeline Testing**: Extract data from one API and pass to another
- **Integration Testing**: Test entire API flows end-to-end
- **Performance Testing**: Chain multiple requests and measure response times
- **Data Validation**: Validate API responses with custom rules

## 🚧 Development

### Project Structure

```
visual-api-flow/
├── src/
│   ├── components/          # React components
│   │   ├── nodes/          # Node-specific components
│   │   ├── NodeEditor.jsx  # Main editor component
│   │   ├── Toolbar.jsx     # Top toolbar
│   │   └── StatusBar.jsx   # Bottom status bar
│   ├── nodes/              # Node definitions
│   │   ├── HttpRequestNode.js
│   │   └── ResponseHandlerNode.js
│   ├── styles/             # CSS styles
│   │   └── globals.css
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json
├── vite.config.js
└── README.md
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔮 Future Features

- **More Node Types**:
  - Data Transform Node (map, filter, transform data)
  - Assertion Node (advanced testing assertions)
  - Loop Node (iterate over arrays)
  - Delay Node (add timing to flows)
  - Environment Variable Node (manage test environments)

- **Advanced Features**:
  - Save/Load flows to file
  - Export to Postman collection
  - Test execution history
  - Performance metrics
  - Authentication handling
  - Mock server integration

- **UI Improvements**:
  - Node templates library
  - Search and filtering
  - Minimap for large flows
  - Keyboard shortcuts
  - Dark/light theme toggle

## 📄 License

MIT License - feel free to use this project for your API testing needs!

## 🤝 Contributing

This is a prototype - contributions welcome! Ideas for improvement:
- Additional node types
- Better error handling
- Performance optimizations
- UI/UX improvements