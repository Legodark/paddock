# Utilizar la imagen de Python 3.8 como base
FROM python:3.8

# Establecer el directorio de trabajo de la imagen de Docker en el directorio de la aplicación Flask
WORKDIR /app

COPY requirements.txt /app/requirements.txt
COPY cars_fit_model.pkl /app/cars_fit_model.pkl
COPY app.py /app/app.py


# Instalar las dependencias del proyecto Flask
RUN pip install --trusted-host pypi.org --no-cache-dir -r requirements.txt

# Especificar el comando que se utilizará para ejecutar la aplicación Flask dentro del contenedor de Docker
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]