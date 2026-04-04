from omnidimension import Client
from db import API_KEY
# Initialize client
client = Client(API_KEY)

# Create an agent
response = client.agent.create(
    name="SmartAuction Assistant",
    welcome_message="""Welcome to SmartAuction! How can I assist you today? Would you like to place a bid, check the highest bid, list products, check time left, or exit?""",
    context_breakdown=[
                {"title": "Greeting and Menu Presentation", "body": """ - Start by welcoming the user: 'Welcome to SmartAuction! You can place a bid, check the highest bid, list products, check time left, or exit. Please say one of the options now.'\n- Prompt the user to state their choice.\n- Wait for user response and extract into variable: 'menu_option'. """ , 
                "is_enabled" : True},
                {"title": "State Management", "body": """             - Maintain: \n                current_state: ['menu', 'awaiting_product', 'awaiting_bid', 'awaiting_userId',awaiting_confirmation', 'processing']\n                current_flow: ['', 'bid', 'check_bid', 'time', 'list', 'exit']\n                last_product: stores last product used """ , 
                "is_enabled" : True},
                {"title": "Main Menu", "body": """             - IF current_state == 'menu' OR user says "menu":\n                - CLEAR: bid_amount\n                - SAY: "You can: place a bid, check highest bid, list products, check time left, or exit. What would you like?"\n                - EXTRACT: user_intent\n                - MATCH:\n                    - "place bid", "bid" → current_flow = "bid", current_state = "awaiting_product"\n                    - "check bid", "highest bid" → current_flow = "check_bid", current_state = "awaiting_product"\n                    - "list", "products" → current_flow = "list", current_state = "processing"\n                    - "time", "time left" → current_flow = "time", current_state = "awaiting_product"\n                    - "exit", "goodbye" → current_flow = "exit", current_state = "processing"\n                - IF no match: "Please choose: place bid, check bid, list products, check time, or exit."\n """ , 
                "is_enabled" : True},
                {"title": "Product Input Handling", "body": """             - IF current_state == "awaiting_product":\n                - IF last_product exists AND user doesn't specify new product:\n                    - SET product_name = last_product\n                    - SET current_state = "processing"\n                - ELSE:\n                    - SAY: "Please say the product name or ID"\n                    - EXTRACT: product_name\n                    - SET last_product = product_name\n                    - SET current_state = "processing" """ , 
                "is_enabled" : True},
                {"title": "Bid Placement Flow", "body": """   - IF current_flow == "bid":\n                - IF current_state == "processing" AND product_name is set:\n                    - SAY: "How much would you like to bid on {{product_name}}?"\n                    - SET current_state = "awaiting_bid"\n\n                - IF current_state == "awaiting_bid":\n                    - EXTRACT: bid_amount\n                    - VALIDATE: Is numeric? \n                    - IF valid: \n                        - SAY: "Please say your user ID to confirm the bid."\n                        - SET current_state = "awaiting_userid"\n                    - ELSE:\n                        - SAY: "Please say a valid bid amount"\n\n                - IF current_state == "awaiting_userid":\n                    - EXTRACT: user_id\n                    - VALIDATE: Exists or not empty\n                    - IF valid:\n                        - SAY: "Confirm ₹{bid_amount} bid on {product_name} by user ID {user_id}? Say yes or no."\n                        - SET current_state = "awaiting_confirmation"\n                    - ELSE:\n                        - SAY: "Please say a valid user ID."\n\n                - IF current_state == "awaiting_confirmation":\n                    - IF user says "yes":\n                        - WEBHOOK: POST /bid (with product_name, bid_amount, user_id)\n                        - ON SUCCESS: "Bid placed! {message}"\n                        - CLEAR: bid_amount, user_id\n                        - SET current_state = "menu"\n                        - SAY: "What else can I do for you?"\n                    - ELSE:\n                        - SAY: "Bid cancelled."\n                        - SET current_state = "menu" """ , 
                "is_enabled" : True},
                {"title": "Highest Bid Check", "body": """             - IF current_flow == "check_bid" AND current_state == "processing" AND product_name is set:\n                - WEBHOOK: GET /product/highest-bid?product_key={{product_name}}\n                - ON SUCCESS: "Highest bid for {{product_name}} is ₹{highest_bid}"\n                - ON ERROR: "Couldn't find bids for {{product_name}}"\n                - CLEAR: product_name\n                - SET current_state = "menu"\n                - SAY: "Anything else?" """ , 
                "is_enabled" : True},
                {"title": "Product Listing Availability", "body": """             - IF current_flow == "list" AND current_state == "processing":\n                - WEBHOOK: GET /products\n                - FORMAT: \n                    - "Available products: {% for p in products %}{{p.name}} (ID: {{p.id}}){% if not loop.last %}, {% endif %}{% endfor %}"\n                - SET current_state = "menu"\n                - SAY: "What would you like to do next?" """ , 
                "is_enabled" : True},
                {"title": "Time Remaining Inquiry", "body": """             - IF current_flow == "time":\n                - IF current_state == "processing" AND product_name is set:\n                    - WEBHOOK: GET /product/time-left?product_key={{product_name}}\n                    - ON SUCCESS: \n                        - CONVERT seconds to: "{{days}} days, {{hours}} hours, {{minutes}} minutes"\n                        - SAY: "Time left for {{product_name}}: {time_str}"\n                    - ON ERROR: "Couldn't find time for {{product_name}}"\n                    - SET current_state = "menu"\n                    - SAY: "What else can I help with?"\n            """ "", 
                "is_enabled" : True},
                {"title": "Context Preservation", "body": """"          - ALWAYS preserve last_product between flows\n            - IF user mentions product in menu state:\n                - SET product_name = extracted_product\n                - SET last_product = product_name\n                - PROCEED to flow with product pre-filled\n                \n            - IF user says "same product" or "last product":\n                - USE last_product for current action """ , 
                "is_enabled" : True},
                {"title": "Exiting the Experience", "body": """             - IF current_flow == "exit":\n                - "Thank you for using SmartAuction! Goodbye!"\n                - End call """ , 
                "is_enabled" : True},
                {"title": "Context Recovery", "body": """             - If user says "menu" at any time:\n                - Reset: conversation_state = "menu", menu_option = None\n                - Go to Main Menu\n            \n            - If no match in current state:\n                - "Sorry, I lost track. Let's start over."\n                - Reset all variables\n                - conversation_state = "menu" """ , 
                "is_enabled" : True},
                {"title": "Error Recovery & Context Preservation", "body": """             - IF no response after 2 prompts:\n                - IF last_product exists:\n                    - SAY: "I'll use your last product {{last_product}}"\n                    - SET product_name = last_product\n                    - SET current_state = "processing"\n                - ELSE:\n                    - SAY: "Let me list available products"\n                    - SET current_flow = "list"\n                    - SET current_state = "processing" """ , 
                "is_enabled" : True}
    ],
    transcriber={
        "provider": "deepgram_stream",
        "silence_timeout_ms": 400,
        "model": "nova-3",
        "numerals": True,
        "punctuate": True,
        "smart_format": False,
        "diarize": False
    },
    model={
        "model": "gpt-4o",
        "temperature": 0.7
    },
    voice={
        "provider": "eleven_labs",
        "voice_id": "OUBnvvuqEKdDWtapoJFn"
    },
    post_call_actions={
        "email": {
            "enabled": True,
            "recipients": ["example@example.com"],
            "include": ["summary", "extracted_variables"]
        },
        "extracted_variables": [
                    {"key": "menu_option", "prompt": "Extract the user's menu selection input."},
                    {"key": "product_name", "prompt": "Extract or clarify the product name or ID provided by user. It can be mix of letters and numbers or anything dont indulge"},
                    {"key": "bid_amount", "prompt": "Collect the amount the user wishes to bid."},
                    {"key": "user_phone", "prompt": "Capture the user's phone number, if applicable, for bid placement."},
                    {"key": "user_menu_intent", "prompt": "Check if user says 'menu' to restart the options."}
        ]
    },
)

print(f"Status: {response['status']}")
print(f"Created Agent: {response['json']}")

# Store the agent ID for later examples
agent_id = response['json'].get('id')