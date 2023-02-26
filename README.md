# Paddok

*TFM realizado por **Oscar Pörtner Ostos** y **Juan Cerezo Serrano** del Master IA y Bigdata del Malaga Tech Park*

### Logo (prototipo)

![Logo-prototipo](images/prototipo_logo.png)


## Índice

* [Justificación y descripción del proyecto](#id1)
* [Obtención de los datos](#id2)
* [Limpieza de datos (Preprocesado)](#id3)
* [Exploración y visualización de los datos](#id4)
* [Preparación de los datos para Machine Learning](#id5)
* [Entrenamiento del modelo y comprobación del rendimiento](#id6)

## 1. Justificación y descripción del proyecto.<a name="id1"></a>

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
[![Flask](https://img.shields.io/badge/Flask-black?style=for-the-badge&logo=Flask&logoColor=white&labelColor=101010)]()
[![Github](https://img.shields.io/badge/Github-black?style=for-the-badge&logo=Github&logoColor=white&labelColor=101010)]()
[![Notion](https://img.shields.io/badge/Notion-black?style=for-the-badge&logo=Notion&logoColor=white&labelColor=101010)]()
[![Jira](https://img.shields.io/badge/Jira-black?style=for-the-badge&logo=Jira&logoColor=blue&labelColor=101010)]()
[![Google](https://img.shields.io/badge/Google--Cloud-black?style=for-the-badge&logo=GoogleCloud&logoColor=orange&labelColor=101010)]()


:chart: Analisis

[![numpy](https://img.shields.io/badge/numpy-black?style=for-the-badge&logo=numpy&logoColor=blue&labelColor=101010)]()[![pandas](https://img.shields.io/badge/pandas-black?style=for-the-badge&logo=pandas&logoColor=purple&labelColor=101010)]()[![Plotly](https://img.shields.io/badge/Plotly-black?style=for-the-badge&logo=Plotly&logoColor=white&labelColor=101010)]()

:brain: Machine Learning

[![scikit](https://img.shields.io/badge/scikit--learn-black?style=for-the-badge&logo=scikit-learn&logoColor=orange&labelColor=101010)]()
[![Tendorflow](https://img.shields.io/badge/TensorFlow-black?style=for-the-badge&logo=TensorFlow&logoColor=orange&labelColor=101010)]()

:spider: Scraping

[![Selenium](https://img.shields.io/badge/Selenium-black?style=for-the-badge&logo=Selenium&logoColor=green&labelColor=101010)]()
[![Beatifulsoup](https://img.shields.io/badge/Beatifulsoup-black?style=for-the-badge&logo=Python&logoColor=orange&labelColor=101010)]()

## 2. Obtención de los datos.<a name="id2"></a>

Puedes ver el desarrollo en el siguiente enlace:

[![colab](https://img.shields.io/badge/Scraping-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)](https://github.com/Legodark/paddok/blob/main/notebooks/extraccion/Scraping_Coches.ipynb)

La obtenición de los datos se ha realizado mediante Scraping de X página de coches donde hemos conseguido sacar unos 179000 coches de diferentes marcas y modelos con sus caracteristicas.

El proceso consistio en tener mas de una araña haciendo el scraping a diferentes marcas lo que ayuda a agilizar el proceso del scraping y tambien para controlar las perdidas de información.

Luego se guardaron los resultados en varios csv y se terminaron uniendo dichos csv hasta tener el csv final con el que se entrenaría poco despues el modelo.

## 3. Limpieza de datos (Preprocesado).<a name="id3"></a>

Puedes ver el desarrollo en el siguiente enlace:

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

#### 4. **Añadir columnas con las ids para las marcas, modelos, combustible, caja de cambios y localidad**

![Funciones-transformadoras](images/images_preprocesado/transform.png)

#### 5. **Creacción de diccionarios para poder trabajar mas comodamente en el desarrollo del frontend**

Por último genero los siguientes diccionarios para poder trabajar comodamente con los datos en Flutter

![Diccionarios](images/images_preprocesado/diccionarios.png)

Y exporto en nuevo DataFrame a drive para poder tratarlo en las visualizaciones y en el machine learning


## 4. Exploración y visualización de los datos.<a name="id4"></a>

Puedes ver el desarrollo en el siguiente enlace

[![colab](https://img.shields.io/badge/Visualización-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)](https://colab.research.google.com/drive/1vD99iTHA803n28a4mzBp8H0fgAPTsd_n?usp=sharing)

En este apartado hemos realizado lo siguiente:

1. Visualización de los datos por cantidad de coches por localidad y modelo en general
2. Visualización de los datos de las marcas con mas de 10.000 coches:
    - Por cantidad mayor de 10.000 coches
    - Por cantidad mayor de 10.000 coches mas limitación de precio a 80.000€ y y kilometros a 500.000Km
        - Visualización por precio/año
        - Visualización por kilometro/año
3. Visualización de los datos de las marcas con menos de 10.000 coches:
    - Por cantidad menor de 10.000 coches mas limitación de precio a 80.000€ y y kilometros a 500.000Km
        - Visualización por precio/año
        - Visualización por kilometro/año
4. Conclusiones

### 1. **Visualización de los datos por cantidad de coches por localidad y modelo en general**

![](images/images_preprocesado/localidad.png)

Otra forma de mostrarlo sería con barras:

![](images/images_preprocesado/bars_cuantity.png)


### 2. **Visualización de los datos de las marcas con mas de 10.000 coches**

Lo primero que mostramos aquí son las marcas donde hay mas de 10000 coches

![](images/images_preprocesado/10000_no_limit.png)

En la siguiente gráfica se puede ver un ejemplo de la cantidad de modelos en relación año/precio sin limitar el precio, como veremos mas adelante.

![](images/images_preprocesado/citroen_no_limit.png)

La gráfica anterior la genere con el siguiente bucle `for`, para poder mostrar la cantidad de modelos por marca para las marcas que estamos analizando.

![](images/images_preprocesado/for_no_limit_10k.png)

Cosas interesante que descubrimos aquí son distintos outlayers, en este caso en relación al precio, lo que me hace pensar que si limito el precio a una cantidad mas baja puedo quitarme este tipo de outlayers, aunque también tengo en contra que elimino coches de gama alta, lo que también nos hace plantearnos que en principio nos centremos en el mercado de media-alta gama.

Aquí la visualización que nos hace plantearnos el filtro:

Outlayer detectado

![](images/images_preprocesado/outlayer.png)

Con el outlayer:
![](images/images_preprocesado/t_roc_no_limit.png)

Sin el outlayer:
![](images/images_preprocesado/t_roc_quit.png)

Ahora bien, la limitación de kilometros la hago por que al revisar el `describe` que el máximo de kilometros es casi 3.000.000Km, por lo que creo que me puede distorsionar los datos en la parte del machine learning, pero antes de realizarlo veo a ver cuantos coches pueden ser afectados con el siguiente código:

![](images/images_preprocesado/cars_up_500000.png)

Como se puede ver solo están afectados 34 coches, por lo que decido limitar el kilometraje a 500.000km.

Ahora voy a realizar algo similar pero con las marcas que contienen menos de 10 coches

Primero saco la cantidad de coches que se verian afectados:

![](images/images_preprocesado/less_cars_filter.png)

Y ahora lo muestro graficamente

![](images/images_preprocesado/less_cars.png)

Viendo que la cantidad de coches afectada no es muy grande decido quitar estas marcas en la parte de preparación de los datos para machine learning que veremos mas adelante

**Limitación de precio a 80.000€ y y kilometros a 500.000Km**

Una vez limitados los datos del DataFrame los resultados son los siguientes:

Limitación por precio.

![limitacion_precio](images/images_preprocesado/audi_limit.png)

Limitación por kilometros.

![limitacion_kilometros](images/images_preprocesado/audi_km_limit.png)

Como se puede ver los datos que mas uniformes, por que en los siguientes pasos voy aplicar lo mismo pero para el resto de coches.

### 3. **Visualización de los datos de las marcas con menos de 10.000 coches**

Empezamos mostrando la cantidad de marcas y de modelos que tenemos en el resto de coches.

![](images/images_preprocesado/rest_cars.png)

A continuación muestro 2 gráficas para marcas inferiores a 10000 coches y con la limitación de precio y kilometros ya establecida.

Gráfica con limitación de precio

![](images/images_preprocesado/dif_cars_year.png)

Gráfica con limitación de kilometros

![](images/images_preprocesado/dif_less_km.png)

Ya para cerrar el apartado de la visualización voy a exponer 2 gráficas que he includo en el colab:

La primera incluye un slider que permite seleccionar el año, esto es util para mostrar la cantidad de coches por año de todas las marcas

![](images/images_preprocesado/slider_price_km.png)

Otra gráfica que muestro es la correlación del precio respecto al motor(KW), ya que en las correlaciones salian bastante relacionadas

![](images/images_preprocesado/engine_power.png)

### Clonclusión de la visualización

Debo de limitar el $\color{orange}{precio}$ a $\color{orange}{80.000€}$, los $\color{orange}{kilometros}$ a $\color{orange}{500.000km}$ y $\color{red}{quitar}$ las $\color{orange}{marcas}$ con cantidad de coches $\color{orange}{inferior}$ a $\color{orange}{10}$.

## 5. Preparación de los datos para Machine Learning.<a name="id5"></a>

Puedes ver el desarrollo en el siguiente enlace:

[![colab](https://img.shields.io/badge/Machine--Learning-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)](https://colab.research.google.com/drive/1nTlGhCdBcAk0hhBRoaWzkcYxJmQlm2qo?usp=sharing)

En este apartado vamos a realizar lo siguiente:

1. Pasar las columnas a nombres en ingles, esto es importante puesto que letras como la `ñ` pueden provocar errores en los algoritmos de TensorFlow.

2. Eliminar columnas no relevantes, revisando con las correlaciones, por ejemplo, para pasarlos a los algoritmos de TensorFlow debo de eliminar las columnas numericas de las ids, para que no haya datos redundantes.

3. Preparar el datasets de diferentes maneras para pasarselo a los algoritmos de ML.

Esta preparación se va a hacer concretamente para 3 algoritmos (2 de TensorFlow y 1 de Sklearn), y hay que prepararlos de diferente forma, ya que para TensorFlow podemos pasarle valores categorios y numericos, pero para Sklean solo podemos pasar numerios.

Dicho lo anterior voy a preparar el dataset que creamos en el punto 3 ***Limpieza de datos (Preprocesado)*** tanto para TensorFlow como para Sklearn.

Los datasets a preparar son los siguientes:

- Dataset completo
- Dataset limitando el precio y los kilometros
- Dataset limitando el precio, los kilometros y las marcas con coches con cantidad inferior a 10
- Dataset limitando el precio, los kilometros, las marcas con coches con cantidad inferior a 10 y dejando solo mas columas de `mark`, `model`, `year`, `horses`, `km`, `fuel`, `gearbox`, `price`, `displacement_engine`, `marches`

Gracias a que pase variables categoricas a numéricas, como, marca, modelo, cambio, combustiable, a la hora de tratar los datasets para Sklearn será mas rápido.

Para realizar todos los puntos anteriores establezco la siguiente clase:

![](images/images_preprocesado/clase_prepare.png)

A continuación cree un diccionario el cual alberca por separado los DataFrames para trabajarlos con mas rapidez en los algoritmos de ML:

![](images/images_preprocesado/diccionario_prepare.png)

Dando para cada DataFrame los siguientes resultados:

***TensorFlow***
---

Para `dict_dataframes['tensorflow']['complete']`

![](images/images_preprocesado/complete_tf.png)

Para `dict_dataframes['tensorflow']['limit']`

![](images/images_preprocesado/limit_tf.png)

Para `dict_dataframes['tensorflow']['less_limit']`

![](images/images_preprocesado/less_limit_tf.png)

Para `dict_dataframes['tensorflow']['less_columns']`

![](images/images_preprocesado/less_columns_tf.png)

***Sklearn***
---

Para `dict_dataframes['sklearn']['complete']`

![](images/images_preprocesado/complete_sk.png)

Para `dict_dataframes['sklearn']['limit']`

![](images/images_preprocesado/limit_sk.png)

Para `dict_dataframes['sklearn']['less_limit']`

![](images/images_preprocesado/less_limit_sk.png)

Para `dict_dataframes['sklearn']['less_columns']`

![](images/images_preprocesado/less_columns_sk.png)

También creo visualizaciones de correlaciones, estas se pueden ver en el colab enlazado al principio de este punto.

## 6. Entrenamiento del modelo y comprobación del rendimiento<a name="id6"></a>

Puedes ver el desarrollo en el siguiente enlace:

[![colab](https://img.shields.io/badge/Machine--Learning-black?style=for-the-badge&logo=Google-Colab&logoColor=orange&labelColor=101010)](https://colab.research.google.com/drive/1nTlGhCdBcAk0hhBRoaWzkcYxJmQlm2qo?usp=sharing)

En este punto lo mas importante es saber que algoritmo de machine learning se va a utilizar, en nuestro caso vamos a trabajar con arboles de decisión en vez de regresiones lineales.

**¿Por que arboles de decisión?**

Para responder a esta pregunta vamos a exponer los 3 puntos que nos han hecho tomar esta decisión:

1. Interpretación: los árboles de decisión son fáciles de interpretar, ya que se puede seguir el árbol y entender las decisiones que se están tomando en cada nodo. Las regresiones lineales, por otro lado, pueden ser más difíciles de interpretar ya que se trata de una relación matemática compleja.

2. Flexibilidad: los árboles de decisión son modelos no paramétricos, lo que significa que no hacen supuestos sobre la forma de la relación entre las variables de entrada y la variable de salida. Por lo tanto, pueden ser más flexibles y capaces de capturar patrones complejos en los datos. Las regresiones lineales, por otro lado, asumen una relación lineal y pueden ser menos flexibles en su capacidad para capturar patrones complejos.

3. Manejo de variables categóricas: los árboles de decisión pueden manejar fácilmente variables categóricas, ya que las decisiones se toman en función de las categorías de las variables de entrada. Las regresiones lineales pueden requerir técnicas adicionales, como la codificación one-hot, para manejar variables categóricas.

Una vez dicho esto y como se vio en el punto 5, vamos a trabajar con 3 algoritmos en concreto, que son los siguientes:

[*`GradientBoostedTreesModel`*](https://www.tensorflow.org/decision_forests/api_docs/python/tfdf/keras/GradientBoostedTreesModel) de **TensoFlow**

[*`RandomForestModel`*](https://www.tensorflow.org/decision_forests/api_docs/python/tfdf/keras/RandomForestModel) de **TensoFlow**

[*`RandomForestRegressor`*](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html) de **Sklearn**

Una vez expuesto esto pasamos a detallar el código utilizado, el rendimiento obtenido y las predicciones para todos los DataFrames que creamos en el punto 5.

**TensoFlow**
---

### Código utilizado para **GradientBoostedTreesModel** y **RandomForestModel**

Empezamos creando una clase para poder llamar comodamente a los algoritmos

![Clase_algoritmos_TensorFlow](images/ML/TensorFlow/clase_selector_tf.png)

En la imagen anterior se puede ver como están configurados los algoritmos para trabajar con regresión donde cada parametro significa lo siguiente:

En **GradientBoostedTreesModel**:

`task=tfdf.keras.Task.REGRESSION`: indica que el modelo de árbol aleatorio se utilizará para un problema de regresión.

`validation_ratio=0.1`: el 10% de los datos de entrenamiento se utilizarán para la validación durante el ajuste del modelo.

`num_trees=100`: el número de árboles en el bosque aleatorio será de 100.

`max_depth=10`: establece la profundidad máxima de cada árbol del bosque en 10.

`l1_regularization=0.01`: la regularización L1 (Lasso) se aplicará al modelo con una fuerza de 0.01. Esta regularización ayuda a evitar el sobreajuste y mejora la generalización del modelo.

`l2_regularization=0.01`: la regularización L2 (Ridge) se aplicará al modelo con una fuerza de 0.01. Esta regularización también ayuda a evitar el sobreajuste y mejora la generalización del modelo.

`early_stopping='LOSS_INCREASE'`: el entrenamiento del modelo se detendrá si el error de validación aumenta durante varias iteraciones consecutivas.

`loss="SQUARED_ERROR"`: se utilizará la función de pérdida de error cuadrático medio (MSE) para medir la discrepancia entre las predicciones del modelo y los valores reales.

En **RandomForestModel**:

`split_axis="AXIS_ALIGNED"`: indica que se utilizará el algoritmo de división de nodos "AXIS_ALIGNED", que divide los datos a lo largo de un eje específico para cada característica.

`categorical_algorithm="CART"`: indica que se utilizará el algoritmo "CART" para manejar variables categóricas. CART es un algoritmo que se utiliza para construir árboles de decisión que manejan tanto variables numéricas como categóricas.

El siguiente código lo que realiza es una preparación y entrenamiento de todos los dataframes, guardando los modelos el google drive y en `dict_tr_ts` los datos de test para poder hacer predicciones despues.

![](images/ML/TensorFlow/entrenamiento_tf.png)

Una vez realizado esto lo que hago es cargar los modelos desde Google drive, esto me permite que cada vez que quiera hacer una predicción no tener que entrenar los modelos.

Para los modelos de `GradientBoostedTreesModel`:

![](images/ML/TensorFlow/gb_tf.png)

Para los modelos de `RandomForestRegressor`:

![](images/ML/TensorFlow/rf_tf.png)

Una vez hecho esto, lo que se realiza es la creación de 2 funciones, una para la representación gráfica del rendimiento de los modelos con las predicciones y otra donde se prueban las predicciones y se muestran dichas gráficas.

**Función para la generación de gráficas**

![](images/ML/TensorFlow/grafic_rf_gb.png)

**Función para probar predicciones y pintar las gráficas**

![](images/ML/TensorFlow/rendimiento_tf.png)

Ahora pasamos a detallar los resultados de las rendimiento y predicciones con los datos de test

### Rendimiento y predicciones utilizado para **GradientBoostedTreesModel** y **RandomForestModel**

Lo primero que se hace aquí es llamar dentro de un for a la función para probar predicciones y pintar las gráficas que hemos descrito en el apartado anterior.

![](images/ML/TensorFlow/rendimiento_tf_llamada.png)

Ahora se pasa a analizar los resultados obtenidos en las predicciones, para no extender mucho la documentación solo aportare el peor resultado y el mejor para ambos algoritmos, si se desea ver mas resultados puede usar el colab expuesto al comienzo de este punto.

Resultado obtenido en el dataset `completo` en **GradientBoostedTreesModel**, sin realizar ningún tipo de limpieza en el dataframe:

Resultados:

![](images/ML/TensorFlow/pre_gb_complete.png)

Gráfica:
![](images/ML/TensorFlow/gb_complete.png)

Resultado obtenido en el dataset `less_limit` en **GradientBoostedTreesModel**, con tratamiento en el dataframe:

Resultados:

![](images/ML/TensorFlow/pre_gb_less_limit.png)

Gráfica:

![](images/ML/TensorFlow/gb_less_limit.png)

Como se puede ver, gracias a tratar el dataframe se nota una mejora importante, en este caso la mejora es del $\color{green}{11}$%, donde también queda demostrado en las predicciones, en donde se puede ver que los precios predecidosb se ajustan mas a los datos reales.

Resultado obtenido en el dataset `completo` en **RandomForestModel**, sin realizar ningún tipo de limpieza en el dataframe:

Resultados:

![](images/ML/TensorFlow/pre_rf_complete.png)

Gráfica:

![](images/ML/TensorFlow/rf_complete.png)

Resultado obtenido en el dataset `less_columns` en **RandomForestModel**, con tratamiento en el dataframe:

Resultados:

![](images/ML/TensorFlow/pre_rf_less_columns.png)

Gráfica:

![](images/ML/TensorFlow/rf_less_columns.png)

En el **RandomForestModel** lo que se puede apreciar que su rendimiento es inferior a **GradientBoostedTreesModel** en parte por que este último permite parametros que mejorar su rendimiento ademas de que de por si es una mejora del **RandomForestModel**.

Lo que podemos ver es que en este caso la mejora entre pasar el dataset completo a uno tratado es de un $\color{green}{8}$%, lo que supone un $\color{red}{3}$% por ciento menos que usando **GradientBoostedTreesModel**.

Por último hacemos una predicción de un coche que esta fuera del dataset, para ello se realiza lo siguiente:

Muestro la tabla de coches de referencia, primero para saber que necesitamos pasar y segundo para saber los precios.

![](images/ML/TensorFlow/tabla_saab.png)

A continuación hacemos el procedimiento para poder predecir el coche con los modelos:

![](images/ML/TensorFlow/saab_test.png)

Por último realizamos la predicción:

![](images/ML/TensorFlow/saab_test_pre.png)

donde obtenemos el siguiente resultado, y si miramos la tabla anteriormente expuesta la predicción da una diferencia con un precio de un coche similar de 100€:

![](images/ML/TensorFlow/pre_saab_result.png)

**Sklearn**
---

### Código utilizado para **RandomForestRegressor**

### Rendimiento y predicciones utilizado para **RandomForestRegressor**