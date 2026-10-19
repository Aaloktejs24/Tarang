package v1

import (
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(
	r chi.Router,
	authHandler *AuthHandler,
) {

	r.Route("/auth", func(r chi.Router) {
		authHandler.RegisterRoutes(r)
	})
}

