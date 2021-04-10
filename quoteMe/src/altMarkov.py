from __future__ import division
import random

class Categorical(object):

    def __init__(self, support, prior):
        self.counts = {x: prior for x in support}
        self.total = sum(self.counts.values())

    def observe(self, event, count=1):
        self.counts[event] += count
        self.total += count

    def sample(self, dice=random):
        sample = dice.uniform(0, self.total)
        for event, count in self.counts.items():
            if sample <= count:
                return event
            sample -= count

    def __getitem__(self, event):
        return self.counts[event] / self.total


class MarkovModel(object):

    def __init__(self, support, order, prior, boundary_symbol=None):
        self.support = set(support)
        self.support.add(boundary_symbol)
        self.order = order
        self.prior = prior
        self.boundary = boundary_symbol
        self.prefix = [self.boundary] * self.order
        self.postfix = [self.boundary]
        self.counts = {}

    def _categorical(self, context):
        if context not in self.counts:
            self.counts[context] = Categorical(self.support, self.prior)
        return self.counts[context]

    def _backoff(self, context):
        context = tuple(context)
        if len(context) > self.order:
            context = context[-self.order:]
        elif len(context) < self.order:
            context = (self.boundary,) * (self.order - len(context)) + context

        while context not in self.counts and len(context) > 0:
            context = context[1:]
        return context

    def observe(self, sequence, count=1):
        sequence = self.prefix + list(sequence) + self.postfix
        for i in range(self.order, len(sequence)):
            context = tuple(sequence[i - self.order:i])
            event = sequence[i]
            for j in range(len(context) + 1):
                self._categorical(context[j:]).observe(event, count)

    def sample(self, context):
        context = self._backoff(context)
        return self._categorical(context).sample()

    def generate(self, maxLen = 20):
        sequence = [self.sample(self.prefix + ['“'])]
        while sequence[-1] != self.boundary and len(sequence) < maxLen:
            sequence.append(self.sample(sequence))
        return sequence[:-1]

    def __getitem__(self, condition):
        event = condition.start
        context = self._backoff(condition.stop)
        return self._categorial(context)[event]

class QuoteGenerator(object):

    def __init__(self, quote_file, order=3, prior=0.0001):
        quotes = set()
        support = set()
        for quote in quote_file:
            quote = quote.replace('\t',' ')
            quote = quote.replace('“', ' “ ')
            quote = quote.replace('”', ' ” ')
            for spaced in ['.','-',',','!','?','(','—',')','–']:
                quote = quote.replace(spaced, ' {0} '.format(spaced))
            quote = quote.split(' ')
            quote.append(None)
            if len(quote) > 0:
                quotes.add(tuple(quote))
                support.update(tuple(quote))
        self.model = MarkovModel(support, order, prior)
        for quote in quotes:
            self.model.observe(quote)

    def generate(self):
        genQuote = self.model.generate()
        while genQuote == None:
            genQuote = self.model.generate()
        return ' '.join(genQuote)


qg = None
if __name__ == "__main__":
    from os import path
    import pickle
    if path.exists('../resources/savedModel.dat'):
        with open('../resources/savedModel.dat', 'rb') as f:
            qg = pickle.load(f)
            for i in range(20 ):
                print(qg.generate())
    else:
        with open("../resources/sourceQuotes.txt") as f:
            random.seed()
            qg = QuoteGenerator(f, order = 4)
            with open('../resources/savedModel.dat', 'wb+') as dump_file:
                pickle.dump(qg, dump_file)
            for i in range(20 ):
                print(qg.generate())
