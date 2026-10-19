package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type CompileTeXRequest struct {
	SourceCode string `json:"sourceCode"`
	Framework  string `json:"framework"` // plain, latex, context
	Engine     string `json:"engine"`    // pdftex, xetex, luatex
}

// CompileTeXResponse handles error cases. On success, we return application/pdf bytes.
type CompileTeXResponse struct {
	Error string `json:"error"`
	Log   string `json:"log"`
}

func (h *ViewerHandler) HandleCompileTeX(w http.ResponseWriter, r *http.Request) {
	var req CompileTeXRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Determine command
	var cmdName string
	var args []string

	framework := strings.ToLower(req.Framework)
	engine := strings.ToLower(req.Engine)

	switch framework {
	case "latex":
		switch engine {
		case "xetex":
			cmdName = "xelatex"
		case "luatex":
			cmdName = "lualatex"
		case "pdftex":
			fallthrough
		default:
			cmdName = "pdflatex"
		}
	case "plain":
		switch engine {
		case "xetex":
			cmdName = "xetex"
		case "luatex":
			cmdName = "luatex"
		case "pdftex":
			fallthrough
		default:
			cmdName = "pdftex"
		}
	case "context":
		cmdName = "context"
		if engine == "xetex" {
			args = append(args, "--engine=xetex")
		}
	default:
		http.Error(w, "Unsupported framework", http.StatusBadRequest)
		return
	}

	// Create a temp dir for compilation
	tmpDir, err := os.MkdirTemp("", "tex_compile_*")
	if err != nil {
		http.Error(w, "Failed to create temp directory", http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(tmpDir)

	texFile := filepath.Join(tmpDir, "main.tex")
	if err := os.WriteFile(texFile, []byte(req.SourceCode), 0644); err != nil {
		http.Error(w, "Failed to write source file", http.StatusInternalServerError)
		return
	}

	// Prepare command
	args = append(args, "-interaction=nonstopmode", "main.tex")
	cmd := exec.Command(cmdName, args...)
	cmd.Dir = tmpDir

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	err = cmd.Run()

	logFile := filepath.Join(tmpDir, "main.log")
	logData, _ := os.ReadFile(logFile)
	logStr := string(logData)
	if logStr == "" {
		logStr = out.String()
	}

	if err != nil {
		// Compilation failed
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CompileTeXResponse{
			Error: "Compilation failed",
			Log:   logStr,
		})
		return
	}

	// On success, read the PDF
	pdfFile := filepath.Join(tmpDir, "main.pdf")
	pdfBytes, err := os.ReadFile(pdfFile)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CompileTeXResponse{
			Error: fmt.Sprintf("Failed to read output PDF: %v", err),
			Log:   logStr,
		})
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.WriteHeader(http.StatusOK)
	w.Write(pdfBytes)
}
