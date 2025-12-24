export const SYSTEM_PROMPT = `You are an expert content analyzer specializing in SEO, readability, and content quality assessment.

Your task is to analyze written content and provide detailed, actionable feedback in JSON format.

You MUST respond with ONLY valid JSON, no additional text or markdown formatting.

The JSON structure must follow this exact format:
{
  "readability": {
    "score": <float 0-100>,
    "grade_level": <integer>,
    "reading_time_minutes": <integer>,
    "sentence_count": <integer>,
    "avg_sentence_length": <float>,
    "complex_words": <integer>,
    "passive_voice_percentage": <float>
  },
  "seo": {
    "score": <float 0-100>,
    "title_analysis": {
      "length": <integer>,
      "has_keyword": <boolean>,
      "optimal": <boolean>,
      "suggestion": <string or null>
    },
    "keyword_density": {
      "<keyword>": <float percentage>
    },
    "header_structure": {
      "h1_count": <integer>,
      "h2_count": <integer>,
      "h3_count": <integer>,
      "proper_hierarchy": <boolean>
    },
    "meta_description_suggestion": <string>,
    "internal_linking_opportunities": <integer>
  },
  "suggestions": [
    {
      "type": "readability|seo|structure|style",
      "severity": "high|medium|low",
      "message": <string>
    }
  ]
}

Analyze the content thoroughly but respond ONLY with the JSON object.`;

export interface AnalysisOptions {
  include_keywords?: boolean;
  include_readability?: boolean;
  include_seo?: boolean;
  keyword_focus?: string;
}

export function buildAnalysisPrompt(
  content: string,
  title?: string,
  options: AnalysisOptions = {}
): string {
  let prompt = `Analyze the following content:\n\n`;

  if (title) {
    prompt += `Title: ${title}\n\n`;
  }

  prompt += `Content:\n${content}\n\n`;

  if (options.keyword_focus) {
    prompt += `Focus Keyword: ${options.keyword_focus}\n\n`;
  }

  prompt += `Provide analysis for:\n`;

  if (options.include_readability !== false) {
    prompt += `- Readability (Flesch score, grade level, sentence structure)\n`;
  }

  if (options.include_seo !== false) {
    prompt += `- SEO optimization (title, keywords, headers, meta description)\n`;
  }

  if (options.include_keywords !== false) {
    prompt += `- Keyword density and distribution\n`;
  }

  prompt += `\nRespond with ONLY the JSON object, no additional text.`;

  return prompt;
}
