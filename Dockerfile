FROM python:3.13.3

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV POETRY_VERSION=2.1.3

RUN pip install --upgrade pip
RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /code

COPY pyproject.toml poetry.lock /code/

RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi --no-root

COPY . /code/

CMD bash -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"