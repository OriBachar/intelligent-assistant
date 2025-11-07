import * as readline from 'readline';
import { connectDB } from '../config/database';
import { runConversation } from '../services/llm/conversationGraph';
import { createConversation, getConversationById } from '../services/context/conversationStore';
import { getMemoryMessages, saveMessageToMemory } from '../services/context/memoryService';
import { BaseMessage } from '@langchain/core/messages';

interface CLIState {
    conversationId: string | null;
    isRunning: boolean;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const printWelcome = () => {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Video Games Intelligent Assistant - CLI Interface       ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nCommands:');
    console.log('  /exit, /quit - Exit the CLI');
    console.log('  /clear - Clear current conversation');
    console.log('  /new - Start a new conversation');
    console.log('  /history - Show conversation history');
    console.log('  /help - Show this help message');
    console.log('\nAsk me anything about video games!');
    console.log('Examples:');
    console.log('  • "Tell me about The Witcher 3"');
    console.log('  • "What games did CD Projekt Red make?"');
    console.log('  • "What games are on PlayStation 5?"');
    console.log('  • "What is the price of Cyberpunk 2077?"');
    console.log('─────────────────────────────────────────────────────────────\n');
};

const printHelp = () => {
    console.log('\nAvailable Commands:');
    console.log('  /exit, /quit  - Exit the CLI');
    console.log('  /clear         - Clear current conversation');
    console.log('  /new           - Start a new conversation');
    console.log('  /history       - Show conversation history');
    console.log('  /help          - Show this help message');
    console.log('\nExample Queries:');
    console.log('  Games:        "Tell me about The Witcher 3"');
    console.log('                "What are the best RPG games?"');
    console.log('                "Show me screenshots of Cyberpunk 2077"');
    console.log('  Developers:   "What games did CD Projekt Red make?"');
    console.log('                "Tell me about Naughty Dog"');
    console.log('  Platforms:    "What games are on PlayStation 5?"');
    console.log('                "Compare Xbox and PlayStation"');
    console.log('  Prices:       "What is the price of Cyberpunk 2077?"');
    console.log('  General:      "What is an RPG?"');
    console.log('                "History of video games"');
    console.log('\nJust type your question to chat with the assistant!\n');
};

const handleCommand = async (input: string, state: CLIState): Promise<boolean> => {
    const trimmed = input.trim();
    const command = trimmed.toLowerCase();
    
    const normalizedCommand = command.startsWith('\\') ? '/' + command.slice(1) : command;

    switch (normalizedCommand) {
        case '/exit':
        case '/quit':
            console.log('\nGoodbye! Thanks for using Video Games Intelligent Assistant!\n');
            state.isRunning = false;
            return false;

        case '/clear':
            state.conversationId = null;
            console.log('\nConversation cleared. Starting fresh!\n');
            return true;

        case '/new':
            try {
                const newConversation = await createConversation();
                state.conversationId = String(newConversation._id);
                console.log(`\nNew conversation started (ID: ${state.conversationId})\n`);
            } catch (error) {
                console.error('\nError creating new conversation:', error);
            }
            return true;

        case '/history':
            if (!state.conversationId) {
                console.log('\nNo active conversation. Start chatting to create one!\n');
                return true;
            }
            try {
                const messages = await getMemoryMessages(state.conversationId);
                if (messages.length === 0) {
                    console.log('\nNo messages in this conversation yet.\n');
                } else {
                    console.log('\nConversation History:');
                    console.log('─────────────────────────────────────────────────────────────');
                    messages.forEach((msg, idx) => {
                        const role = msg.constructor.name === 'HumanMessage' ? 'You' : 'Assistant';
                        const content = msg.content as string;
                        const preview = content.length > 100 
                            ? content.substring(0, 100) + '...' 
                            : content;
                        console.log(`\n${idx + 1}. [${role}]: ${preview}`);
                    });
                    console.log('─────────────────────────────────────────────────────────────\n');
                }
            } catch (error) {
                console.error('\nError loading conversation history:', error);
            }
            return true;

        case '/help':
            printHelp();
            return true;

        default:
            if (normalizedCommand.startsWith('/')) {
                console.log(`\nUnknown command: ${trimmed}. Type /help for available commands.\n`);
                return true;
            }
            return false;
    }
};

const processMessage = async (input: string, state: CLIState): Promise<void> => {
    if (!input.trim()) {
        return;
    }

    let conversationHistory: BaseMessage[] = [];

    if (state.conversationId) {
        try {
            const conversation = await getConversationById(state.conversationId);
            if (!conversation) {
                console.log('\nPrevious conversation not found. Creating new one...\n');
                state.conversationId = null;
            } else {
                conversationHistory = await getMemoryMessages(state.conversationId);
            }
        } catch (error) {
            console.error('\nError loading conversation:', error);
            state.conversationId = null;
        }
    }

    if (!state.conversationId) {
        try {
            const newConversation = await createConversation();
            state.conversationId = String(newConversation._id);
        } catch (error) {
            console.error('\nError creating conversation:', error);
            return;
        }
    }

    console.log('\nThinking...\n');

    try {
        const startTime = Date.now();
        const { response, state: conversationState } = await runConversation(input, conversationHistory);
        const endTime = Date.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);

        const apiDataUsed = conversationState.needsApiData === true || conversationState.apiData !== null;

        await saveMessageToMemory(
            state.conversationId!,
            'user',
            input,
            conversationState.intent,
            {
                apiDataUsed: false,
            }
        );

        await saveMessageToMemory(
            state.conversationId!,
            'assistant',
            response,
            conversationState.intent,
            {
                apiDataUsed,
                validation: conversationState.validation ? {
                    isValid: conversationState.validation.isValid,
                    confidence: conversationState.validation.confidence.overall,
                    summary: conversationState.validation.summary,
                } : undefined,
            }
        );

        console.log('Assistant:');
        console.log('─────────────────────────────────────────────────────────────');
        console.log(response);
        console.log('─────────────────────────────────────────────────────────────');

        if (conversationState.validation) {
            const { confidence, isValid } = conversationState.validation;
            const confidenceLevel = confidence.overall.toUpperCase();
            console.log(`\nConfidence: ${confidenceLevel} | Valid: ${isValid ? 'Yes' : 'No'}`);
        }

        if (conversationState.intent) {
            console.log(`Intent: ${conversationState.intent.toUpperCase()}`);
        }

        console.log(`\nProcessing time: ${processingTime}s`);
        console.log('');
    } catch (error) {
        console.error('\nError processing message:', error instanceof Error ? error.message : error);
        console.log('');
    }
};

const startCLI = async (): Promise<void> => {
    printWelcome();

    const state: CLIState = {
        conversationId: null,
        isRunning: true,
    };

    const askQuestion = (): void => {
        rl.question('You: ', async (input: string) => {
            if (!state.isRunning) {
                rl.close();
                return;
            }

            const isCommand = await handleCommand(input, state);
            
            if (!isCommand && state.isRunning) {
                await processMessage(input, state);
            }

            if (state.isRunning) {
                askQuestion();
            } else {
                rl.close();
                process.exit(0);
            }
        });
    };

    askQuestion();
};

const main = async (): Promise<void> => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Connected to database');
        await startCLI();
    } catch (error) {
        console.error('Failed to start CLI:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
};

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export { startCLI };