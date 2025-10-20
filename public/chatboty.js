

const baseURL = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  // Global variables
  let currentUserId = null;
  let currentChatDomain = 'business';
  let activeChatSessions = {};

  // DOM Elements
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginOverlay = document.getElementById("login-overlay");
  const blurWrapper = document.getElementById("blur-wrapper");
  const domainButtons = document.querySelectorAll(".domain-btn");
  const chatInterfaces = document.querySelectorAll(".chat-interface");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const historyPanel = document.getElementById("history-panel");
  const historyDomainList = document.getElementById("history-domain-list");
  const newchat = document.getElementById("new-chat") ; 

  // Initialize default active interface
  document.getElementById("business").classList.add("active");

  // Auth form navigation
  function showSignup() {
    loginForm.style.display = "none";
    signupForm.style.display = "flex";
  }

  function showLogin() {
    signupForm.style.display = "none";
    loginForm.style.display = "flex";
  }

  // User Authentication
async function handleLogin(event) {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch('/login', {   // ✅ removed localhost
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUserId = data.userId;
      localStorage.setItem('user_id', data.userId);
      loginOverlay.style.display = "none";
      blurWrapper.classList.add("clear");
      initializeAllChats();
    } else {
      Swal.fire({
  title: "Error!",
  text: "Invalid credentials.",
  icon: "error",
  confirmButtonText: "OK"
});

    }
  } catch (error) {
    console.error('Login failed:', error);
    Swal.fire({
  title: "Error!",
  text: "login failed, please try again.",
  icon: "error",
  confirmButtonText: "OK"
});;
  }
}


async function handleSignup(event) {
  event.preventDefault();

  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const response = await fetch('/signup', {   // ✅ removed localhost
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
  title: "Success!",
  text: `Account created for ${username}. Now login`,
  icon: "success",
  confirmButtonText: "Continue"
});
      
      showLogin();
    }
     else if (data.error) {
      Swal.fire({
  title: "Error!",
  text: "signup failed, please try again.",
  icon: "error",
  confirmButtonText: "OK"
});

    }
  } catch (error) {
    console.error('Signup failed:', error);
         Swal.fire({
  title: "Error!",
  text: "signup failed, please try again.",
  icon: "error",
  confirmButtonText: "OK"
});
  }
}

  // Initialize all chat interfaces
  function initializeAllChats() {
    initializeChat("business", "pro-input", "send", "business_chat");
    initializeChat("tech", "pro-input2", "send2", "tech_chat");
    initializeChat("general", "pro-input3", "send3", "general_chat");
    initializeChat("language", "pro-input4", "send4", "language_chat");
    initializeChat("school", "pro-input6", "send6", "school_chat");
    initializeChat("health", "pro-input7", "send7", "health_chat");
  }

  // Initialize a single chat interface
  function initializeChat(modelName, inputId, sendButtonId, chatInstanceId) {
    const userInput = document.getElementById(inputId);
    const sendButton = document.getElementById(sendButtonId);
    const chatMessages = document.querySelector(`#${modelName} .chat-messages`);
    
    let userId = currentUserId || localStorage.getItem("user_id");
    if (!userId) {
      console.warn("User not authenticated");
      return;
    }

    let chatHistory = [];

    // Load domain-specific history
    async function loadChatHistory() {
      try {
        const response = await fetch(
          `${baseURL}/${userId}/${modelName}`
        
        );
        
        if (!response.ok) throw new Error("Failed to load chat history");
        
        const history = await response.json();
        chatMessages.innerHTML = "";
        chatHistory.length = 0;

        history.forEach((msg) => {
          displayMessage(msg.message, msg.sender, chatMessages);
          chatHistory.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.message }]
          });
        });
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }

    loadChatHistory();
// Message sending handler
async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Show "AI is typing..." toast
  const typingToast = Toastify({
    text: "🤖 AI is typing...",
    gravity: "bottom",
    position: "left",
    backgroundColor: "linear-gradient(to right, #28acc6, #5ce2fdff)",
    close: false,
    duration: -1 // stays until we hide it manually
  });
  typingToast.showToast();

  // Display user's message
  displayMessage(message, "user", chatMessages);
  userInput.value = "";

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: message,
        chatHistory: chatHistory,
        modelName: modelName,
        userId: userId
      }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // Hide the typing toast once response is received
    typingToast.hideToast?.();

    // Display bot response
    const geminiResponse = data.response;
    displayMessage(geminiResponse, "model", chatMessages);

    // Update chat history
    chatHistory.push({ role: "user", parts: [{ text: message }] });
    chatHistory.push({ role: "model", parts: [{ text: geminiResponse }] });

  } catch (error) {
    console.error("Error generating response:", error);
    typingToast.hideToast?.(); // ensure toast is removed if error happens

    // Show a nice error toast
    Toastify({
      text: "⚠️ Something went wrong. Please try again.",
      gravity: "bottom",
      position: "left",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      duration: 3000
    }).showToast();
  }
}


    // Event listeners
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  // Display message in chat container
  function displayMessage(message, sender, chatMessages) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    newchat.addEventListener("click", () => {
    if (currentChatDomain) {
    activeChatSessions[currentChatDomain] = [];  // Clear session for that domain
    chatMessages.innerHTML = '';                 // Clear the displayed messages only
  }
    });
  }
  

  // Domain button event listeners
  domainButtons.forEach((button) => {
    button.addEventListener("click", () => {
      chatInterfaces.forEach((interface) => {
        interface.classList.remove("active");
      });

      const domain = button.getAttribute("data-domain");
      document.getElementById(domain).classList.add("active");
      currentChatDomain = domain;
    });
  });

  // Sidebar toggle functionality
  let sidebarVisible = true;
  function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    sidebar.classList.toggle("collapsed");
    sidebarToggle.innerHTML = sidebarVisible
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
    localStorage.setItem(
      "sidebarState",
      sidebarVisible ? "expanded" : "collapsed"
    );
  }

  // Initialize sidebar state
  if (localStorage.getItem("sidebarState") === "collapsed") {
    toggleSidebar();
  }
  sidebarToggle.addEventListener("click", toggleSidebar);

  // Chat History Panel
  document.getElementById("chatHistoryBtn").addEventListener("click", () => {
    historyPanel.classList.remove("hidden");
  });

  document.getElementById("backtochat").addEventListener("click", () => {
    historyPanel.classList.add("hidden");
  });

  // Domain selection in history panel
  // Domain selection in history panel
// Domain selection in history panel
historyDomainList.querySelectorAll("li").forEach(item => {
  item.addEventListener("click", async function() {
    const domain = this.getAttribute("data-topic");
    const userId = currentUserId || localStorage.getItem("user_id");

    if (!userId) {
           Swal.fire({
  title: "Error!",
  text: "please log in to view chat history!.",
  icon: "error",
  confirmButtonText: "OK"
});
      return;
    }

    try {
      const response = await fetch(
         `${baseURL}/api/chat/history/${userId}/${domain}`
      );

      if (!response.ok) throw new Error("Failed to load domain history");

      const history = await response.json();
      const chatContainer = document.querySelector(`#${domain} .chat-messages`); // ✅ fixed selector

      if (chatContainer) {
        chatContainer.innerHTML = "";
        history.forEach(msg => {
          displayMessage(msg.message, msg.sender, chatContainer);
        });

        // Show the correct chat domain
        document.querySelectorAll(".chat-interface").forEach(el => {
          el.classList.remove("active");
        });
        document.getElementById(domain).classList.add("active");
        currentChatDomain = domain;
      }
    } catch (error) {
      console.error("Error loading domain history:", error);
           Swal.fire({
  title: "Error!",
  text: "failed to load chat history for this domain.",
  icon: "error",
  confirmButtonText: "OK"
});
    }
  });
});


document.getElementById('logout-btn')?.addEventListener('click', () => {
  // Clear saved user info
  localStorage.removeItem('user_id');
  currentUserId = null;

  // Optionally clear chat messages from the UI
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) chatMessages.innerHTML = '';


  if (loginOverlay && blurWrapper) {
    loginOverlay.style.display = "flex";
    blurWrapper.classList.remove("clear");
  }

 Swal.fire({
  title: "Success!",
  text: "you have been logged out.",
  icon: "success",
  confirmButtonText: "Continue"
});

});



  // Proper event listener attachment
  document.querySelector('button[onclick="handleLogin()"]').onclick = handleLogin;
  document.querySelector('button[onclick="handleSignup()"]').onclick = handleSignup;
  document.querySelector('a[onclick="showSignup()"]').onclick = showSignup;
  document.querySelector('a[onclick="showLogin()"]').onclick = showLogin;

  // Prevent form submission
  loginForm.addEventListener("submit", (e) => e.preventDefault());
  signupForm.addEventListener("submit", (e) => e.preventDefault());
  
  

 // Ensure you have <input id="fileInput" type="file" style="display:none">




});
