import os
from tensorflow import keras  # pylint: disable=no-name-in-module

_CACHE: dict[str, keras.Model] = {}


def load_tf_model(path: str) -> keras.Model:
    """Load (and cache) a Keras model saved via model.save()."""
    if path in _CACHE:
        return _CACHE[path]
    model = keras.models.load_model(path)
    _CACHE[path] = model
    return model


def artifacts_path(name: str) -> str:
    return os.path.join("artifacts", name)
