import string

# Este tokenizer será usado por el modelo de clasificacion de mensajes
# para extraer las palabras de un mensaje y realizar la clasificación
class Tokenizer:
  @staticmethod
  def tokenize(sentence):
    punctuation = set(string.punctuation)
    tokens = []
    for token in sentence.split():
      new_token = []
      for character in token:
        if character not in punctuation:
          new_token.append(character.lower())
      if new_token:
        tokens.append("".join(new_token))
    return tokens