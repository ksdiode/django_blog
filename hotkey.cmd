@echo off
doskey runserver=python manage.py runserver $*
doskey makemigrations=python manage.py makemigrations $*
doskey migrate=python manage.py migrate $*
doskey django-app=python manage.py startapp $*
doskey commit=git commit $*
doskey push=git push -u origin main
doskey pull=git pull origin main
@echo on