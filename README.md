# Paddok

*TFM realizado por **Oscar Pörtner Ostos** y **Juan Cerezo Serrano** del Master IA y Bigdata del Malaga Tech Park*

### Logo (prototipo)

![Logo-prototipo](images/prototipo_logo.png)

## 1. Justificación y descripción del proyecto.

### :black_nib: Justificación

El motivo de elegir este proyecto es el reto de obtener el precio de forma rápida para poder vender un coche o varios, puesto que creemos que las páginas de segunda mano no ayudan al vendedor con información precisa y de forma gráfica a que precio puede vender un particular o empresario su vehículo.

Nosotros queremos ayudar al particular o empresario a que con un simple vistazo pueda obtener con la mejor exactitud posible un precio al que poder vender su coche o coches, aportando información relevante y usando datos reales del mercado de coches de segunda mano de España.

### :book: Descripción

El proyecto consta de lo siguiente:

- Un modelo de predicción de precios de coches de segunda mano para el mercado Español. 
- Un chatbot que es capaz de orientar al usuario (particular o profesional) en los precios que hay en el mercado y sobre el coche o coches que quiera vender.
- Panel con estadísticas de mercado.

Con esto vamos a desarrollar, en un mismo panel, que el usuario pueda visualizar con estadísticas de manera rápida el estado del mercado de coches de segunda mano, usando filtros y con las implementaciones anteriormente mencionadas, para poder estimar cuál es el precio de venta más óptimo para vender su coche o coches.

### :computer: Tecnologías usadas:

:snake: Desarrollo

[![python](https://img.shields.io/badge/python-black?style=for-the-badge&logo=python&logoColor=blue&labelColor=101010)]()
[![colab](https://img.shields.io/badge/Colab-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)]()
[![Flutter](https://img.shields.io/badge/Flutter-black?style=for-the-badge&logo=Flutter&logoColor=blue&labelColor=101010)]()
[![Github](https://img.shields.io/badge/Github-black?style=for-the-badge&logo=Github&logoColor=white&labelColor=101010)]()
[![Notion](https://img.shields.io/badge/Notion-black?style=for-the-badge&logo=Notion&logoColor=white&labelColor=101010)]()
[![Jira](https://img.shields.io/badge/Jira-black?style=for-the-badge&logo=Jira&logoColor=blue&labelColor=101010)]()


:chart: Analisis

[![numpy](https://img.shields.io/badge/numpy-black?style=for-the-badge&logo=numpy&logoColor=blue&labelColor=101010)]()[![pandas](https://img.shields.io/badge/pandas-black?style=for-the-badge&logo=pandas&logoColor=purple&labelColor=101010)]()[![Plotly](https://img.shields.io/badge/Plotly-black?style=for-the-badge&logo=Plotly&logoColor=white&labelColor=101010)]()

:brain: Machine Learning

[![scikit](https://img.shields.io/badge/scikit--learn-black?style=for-the-badge&logo=scikit-learn&logoColor=orange&labelColor=101010)]()
[![Tendorflow](https://img.shields.io/badge/TensorFlow-black?style=for-the-badge&logo=TensorFlow&logoColor=orange&labelColor=101010)]()

:spider: Scraping

[![Selenium](https://img.shields.io/badge/Selenium-black?style=for-the-badge&logo=Selenium&logoColor=green&labelColor=101010)]()
[![Beatifulsoup](https://img.shields.io/badge/Beatifulsoup-black?style=for-the-badge&logo=Python&logoColor=orange&labelColor=101010)]()

## 2. Obtención de los datos

La obtenición de los datos se ha realizado mediante Scraping de X página de coches donde hemos conseguido sacar unos 179000 coches de diferentes marcas y modelos con sus caracteristicas.

El proceso consistio en tener mas de una araña haciendo el scraping a diferentes marcas lo que ayuda a agilizar el proceso del scraping y tambien para controlar las perdidas de información.

Luego se guardaron los resultados en varios csv y se terminaron uniendo dichos csv hasta tener el csv final con el que se entrenaría poco despues el modelo.

