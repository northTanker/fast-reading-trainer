"use client";

import { useState, useEffect } from "react";
import { generateQuiz } from "@/lib/deepseek";
import type { QuizQuestion } from "@/types";

interface QuizPanelProps {
  text: string;
  initialMode: "default" | "custom";
  onClose: (scorePercentage?: number) => void;
}

export default function QuizPanel({ text, initialMode, onClose }: QuizPanelProps) {
  const [step, setStep] = useState<"setup" | "loading" | "playing" | "result">("setup");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [difficulty, setDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("deepseek_api_key");
    if (savedKey) {
      setTimeout(() => setApiKeyInput(savedKey), 0);
    }
  }, []);

  const handleStartQuiz = async (useDefault: boolean) => {
    setError("");
    let keyToUse = "";

    if (!useDefault) {
      if (!apiKeyInput.trim()) {
        setError("Masukkan API Key terlebih dahulu.");
        return;
      }
      keyToUse = apiKeyInput.trim();
      localStorage.setItem("deepseek_api_key", keyToUse);
    }

    setStep("loading");
    try {
      const generatedQuestions = await generateQuiz(text, keyToUse || undefined, difficulty);
      setQuestions(generatedQuestions);
      setStep("playing");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat kuis.";
      setError(msg);
      setStep("setup");
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === questions[currentQuestionIndex].correctAnswerIndex;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setStep("result");
    }
  };

  if (step === "setup") {
    return (
      <div className="glass-panel w-full max-w-2xl mx-auto rounded-3xl p-8 flex flex-col gap-6 text-zinc-900 dark:text-zinc-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold font-outfit mb-2">Kuis Pemahaman (AI)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            {initialMode === "custom" 
              ? "Masukkan API Key Deepseek Anda dan atur tingkat kesulitan." 
              : "Pilih tingkat kesulitan untuk membuat kuis yang sesuai."}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Tingkat Kesulitan
            </label>
            <div className="flex gap-2">
              {(["mudah", "sedang", "sulit"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm capitalize transition-all border-2 ${
                    difficulty === level
                      ? "bg-amber-500 border-amber-500 text-white shadow-md"
                      : "bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50"
                  }`}
                >
                  {level}
                  <span className="block text-[10px] font-normal mt-1 opacity-80">
                    {level === "mudah" ? "5 Soal Dasar" : level === "sedang" ? "7 Soal Inferensi" : "10 Soal Analitis"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {initialMode === "custom" && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Gunakan API Key Pribadi (Deepseek)
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-colors font-mono text-sm"
              />
            </div>
          )}

          <button
            onClick={() => handleStartQuiz(initialMode === "default")}
            className="w-full py-4 mt-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold transition-all shadow-md active:scale-[0.98]"
          >
            Mulai Kuis
          </button>
        </div>

        <button
          onClick={() => onClose()}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mt-2"
        >
          Batal
        </button>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="glass-panel w-full max-w-2xl mx-auto rounded-3xl p-12 flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-700 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse text-center">
          AI sedang menganalisis teks Anda dan membuat soal...
        </p>
      </div>
    );
  }

  if (step === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="glass-panel w-full max-w-2xl mx-auto rounded-3xl p-8 flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-extrabold font-outfit text-zinc-900 dark:text-zinc-100">
          Kuis Selesai!
        </h2>
        <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white dark:bg-zinc-800 border-4 border-amber-500 shadow-xl">
          <span className="text-4xl font-extrabold text-amber-500">{percentage}%</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">
          Anda menjawab benar {score} dari {questions.length} soal.
        </p>
        <button
          onClick={() => onClose(percentage)}
          className="w-full py-4 mt-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold hover:-translate-y-1 transition-transform shadow-lg active:scale-[0.98]"
        >
          Tutup Kuis
        </button>
      </div>
    );
  }

  // Playing state
  const question = questions[currentQuestionIndex];
  return (
    <div className="glass-panel w-full max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
          Pertanyaan {currentQuestionIndex + 1} / {questions.length}
        </span>
        <span className="text-sm font-bold text-zinc-500">
          Skor: {score}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-outfit leading-snug">
        {question.question}
      </h3>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          let btnClass = "border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20";
          
          if (isAnswered) {
            if (idx === question.correctAnswerIndex) {
              btnClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-2 ring-green-500/50";
            } else if (idx === selectedOption) {
              btnClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
            } else {
              btnClass = "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-500 opacity-50";
            }
          } else if (selectedOption === idx) {
            btnClass = "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm sm:text-base ${btnClass}`}
            >
              <div className="flex gap-4 items-center">
                <span className="font-mono text-xs opacity-50">{String.fromCharCode(65 + idx)}.</span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-4 mt-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
        >
          {currentQuestionIndex < questions.length - 1 ? "Selanjutnya" : "Lihat Hasil"}
        </button>
      )}
    </div>
  );
}
