install: 
	docker-compose up --build -d

nvm_use:
	. ${NVM_DIR}/nvm.sh && nvm install 18.18.2 && nvm use 18.18.2

db_install:
	. ${NVM_DIR}/nvm.sh && nvm install 18.18.2 && nvm use 18.18.2 && cd supabase && npm install --save-dev supabase && npx supabase init && npx supabase start	

db_start:
	cd supabase && npx supabase start

db_stop:
	cd supabase && npx supabase stop

db_status:
	cd supabase && npx supabase status

start:
	docker-compose up -d

down:
	docker-compose down
