from transformers import pipeline

# Lazy-load the model to avoid slow startup times
_summarizer = None

def _get_summarizer():
    """Lazy-load the summarization model on first use."""
    global _summarizer
    if _summarizer is None:
        _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return _summarizer

def summarize_report(content: str) -> str:
    """
    Summarizes long textual report content.
    Loads the model lazily on first use to improve startup time.
    """
    text = content.decode("utf-8") if isinstance(content, bytes) else content
    text_to_summarize = f"Summarize this text WITHOUT changing the sentence order: {text}"
    summarizer = _get_summarizer()
    summary = summarizer(text_to_summarize[:3000], max_length=120, min_length=40, do_sample=False)
    return summary[0]['summary_text']