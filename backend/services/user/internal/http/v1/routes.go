package v1

import (
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(
	r chi.Router,
	userHandler *UserHandler,
	kycHandler *KycHandler,
) {
	r.Route("/user", func(r chi.Router) {
		userHandler.RegisterRoutes(r)
	})

	r.Route("/kyc", func(r chi.Router) {
		kycHandler.RegisterRoutes(r)
	})
}
