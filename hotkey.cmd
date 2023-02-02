@echo off
doskey runserver=python manage.py runserver $*
doskey makemigrations=python manage.py makemigrations $*
doskey migrate=python manage.py migrate $*
doskey django-app=python manage.py startapp $*
@echo on