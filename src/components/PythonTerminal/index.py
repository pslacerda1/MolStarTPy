import builtins
import typing
from collections import namedtuple

#
# Kind detection for auto-completion
#

Token = namedtuple('Token', 'name kind')

class Kind:
    TYPE = 'Type'
    CALLABLE = 'Callable'
    OBJECT = 'Object'

def detect_kind(obj):
    if isinstance(obj, type):
        return Kind.TYPE
    if isinstance(obj, typing.Callable):
        return Kind.CALLABLE
    return Kind.OBJECT

def introspect_members(obj):
    return [
        Token(m, detect_kind(m))
        for m in dir(obj)
        if not m.startswith('_')
    ]

def introspect_globals(exclude_errors=True):
    globals_ = globals().keys()
    builtins_ = (b for b in dir(builtins))
    vars = (*globals_, *builtins_)
    vars = (v for v in vars if not v.startswith('_'))
    if exclude_errors:
        vars = (v for v in vars if 'Errors' not in v and 'Exception' not in v)
    return [Token(v, detect_kind(v)) for v in vars]
