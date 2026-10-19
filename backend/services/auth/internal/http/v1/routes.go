package v1

import (
	"backend/services/auth/internal/http/v1/authhandler"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(
	r chi.Router,
	authHandler *authhandler.AuthHandler,
) {

	r.Route("/auth", func(r chi.Router) {
		authHandler.RegisterRoutes(r)
	})
}

