prebackend:
	if ! $$(pgrep mongod); then \
		mongod & \
	fi
backend: prebackend
	npm start
frontend:
	cd public && npm run dev
run: backend
	frontend

.PHONY: prebackend backend prefrontend frontend run
