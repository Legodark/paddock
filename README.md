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

## 3. Limpieza de datos (Preprocesado)

Puedes ver el desarrollo en el siguiente enlace

[![colab](https://img.shields.io/badge/Preprocesado-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)](https://colab.research.google.com/drive/14CdROaZuniafhFfBusH0nw_SfA0l_OW7?usp=sharing)

En este apartado lo que hemos realizado lo siguiente:

1. Busqueda de nulos
2. Visualización de correlaciones
3. Eliminación de columnas que no son relevantes
4. Añadir columnas con las ids para las marcas, modelos, combustible y caja de cambios.
5. Creacción de diccionarios para poder trabajar mas comodamente en el desarrollo del frontend

#### 1. **Busqueda de nulos**

Para buscar los nulos he usado el comando `cars.isnull().sum()` donde he obtenido el siguiente resultado:

![nulos](images/images_preprocesado/nulos.png)

Como se puede ver, gracias a una buena adquisición de los datos no tenemos ningún nulo.

#### 2. **Visualización de correlaciones**

Ahora vamos a explicar un poco las correlaciones.

En este caso el foco prinpipal lo vamos a poner en la parte del precio, puesto que es la variable target y queremos ver que otras variables pueden afectarle en menor o mayor medida a la hora de predecir un precio.

En la siguiente imagen se muestran las correlaciones generales
![Correlaciones-Genereales](images/images_preprocesado/corr.png)

y en la siguiente imagen se muestran las correlaciones sobre los precios

![Correlaciones-Precio](images/images_preprocesado/corr_precio.png)

Por último visualizo las correlaciones entre el precio, los kilometros y el año, puesto que estas suelen ser las variables que se suelen buscar mas a la hora de comprar un coche de segunda mano.

![Correlacion-Visual](images/images_preprocesado/corr_vi.png)

#### 3. **Eliminación de columnas que no son relevantes**

Las columnas que voy a eliminar y que no considero relevantes viendo las correlaciones son las siguientes:

Algunas las quito por lógica y otras por que veo en las correlaciones que no influiran en el precio.

`'Unnamed: 0', 'puertas', 'maletero', 'longitud', 'altura', 'anchura', 'peso max', 'vel. maxima', 'c. mixto', 'c. urbano', 'extraurbano', 'cilindros', 'par maximo', 'color', 'garantía', 'vendedor', 'transmisión', 'carroceria', 'traccion'`

A este DataFrame sin las antiguas columnas lo voy a llamar `cars_pre`

#### 4. **Añadir columnas con las ids para las marcas, modelos, combustible y caja de cambios.**

![Funciones-transformadoras](images/images_preprocesado/transform.png)

#### 5. **Creacción de diccionarios para poder trabajar mas comodamente en el desarrollo del frontend**

Por último genero los siguientes diccionarios para poder trabajar comodamente con los datos en Flutter

![Diccionarios](images/images_preprocesado/diccionarios.png)


## 4. Exploración y visualización de los datos
