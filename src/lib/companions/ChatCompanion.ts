import { 
  Drama, 
  CompanionConfig, 
  AutoCompanion,
  Context,
  Chat,
  Category
} from "@write-with-laika/drama-engine";

export class ChatCompanion extends AutoCompanion {
  constructor(configuration: CompanionConfig, drama: Drama) {
    super(configuration, drama);
  }

  protected async processMessage(message: string): Promise<string> {
    const currentSituation = this.configuration.situations.find(s => s.id === this.drama.situation);
    const prompt = `${this.getBasePrompt()}
${currentSituation?.prompt || ''}
User message: ${message}`;

    // In a real implementation, this would call an LLM API
    return `Response from ${this.configuration.name}: ${message}`;
  }

  public override getModelConfig = () => ({
    model: "gpt-3.5-turbo",
    n: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    repetition_penalty: 1,
    temperature: 0.7,
    max_tokens: 150,
    top_p: 1,
    top_k: 40,
    stop: [] as string[],
    stop_token_ids: [] as number[],
    ignore_eos: false,
    skip_special_tokens: true,
    spaces_between_special_tokens: true,
    stream: false,
    best_of: 1,
    logprobs: null,
    echo: false,
    extra: {
      template: {
        bos_token: "<s>",
        eos_token: "</s>",
        unk_token: "<unk>",
        chat_template: "{{#each messages}}\n{{#if @first}}{{system}}{{/if}}\n{{#if role}}{{role}}: {{/if}}{{content}}\n{{/each}}"
      },
      promptConfig: {
        system_prompt: "You are a helpful AI assistant.",
        user_prefix: "User",
        assistant_prefix: "Assistant",
        separator: "\n",
        max_history: 10,
        include_system_prompt: true,
        include_context: true,
        include_names: true,
        max_prompt_length: 4096,
        job_in_chat: true,
        system_role_allowed: true
      }
    }
  });

  public override getMottosByEvent = (event: Category) => [];

  public override getRandomMottoByEvent = (event: Category) => '';
}
