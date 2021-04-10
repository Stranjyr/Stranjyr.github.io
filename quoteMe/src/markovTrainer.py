import numpy as np
from numpy.random import choice
import random
from random import random 
from scipy.sparse import dok_matrix
FILENAME = '../resources/sourceQuotes.txt'
k = 4


quotes= []

# Main Code
with open(FILENAME) as f:
    for line in f:
        line = line.replace('\n',' ')
        line = line.replace('\t',' ')
        line = line.replace('“', ' " ')
        line = line.replace('”', ' " ')
        for spaced in ['.','-',',','!','?','(','—',')','–']:
            line = line.replace(spaced, ' {0} '.format(spaced))
        quotes.append(line)

corpus_words = []
for q in quotes:
    corpus_words += q.split(' ')
corpus_words= [word for word in corpus_words if word != '']
print("{} Words total".format(len(corpus_words)))

distinct_words = list(set(corpus_words))
word_idx_dict = {word: i for i, word in enumerate(distinct_words)}
distinct_words_count = len(list(set(corpus_words)))
print("{} Distinct Words total".format(distinct_words_count))

sets_of_k_words = [ ' '.join(corpus_words[i:i+k]) for i, _ in enumerate(corpus_words[:-k]) ]

sets_count = len(list(set(sets_of_k_words)))
next_after_k_words_matrix = dok_matrix((sets_count, len(distinct_words)))

distinct_sets_of_k_words = list(set(sets_of_k_words))
k_words_idx_dict = {word: i for i, word in enumerate(distinct_sets_of_k_words)}

for i, word in enumerate(sets_of_k_words[:-k]):

    word_sequence_idx = k_words_idx_dict[word]
    next_word_idx = word_idx_dict[corpus_words[i+k]]
    next_after_k_words_matrix[word_sequence_idx, next_word_idx] +=1




def weighted_choice(objects, weights):
    """ returns randomly an element from the sequence of 'objects', 
        the likelihood of the objects is weighted according 
        to the sequence of 'weights', i.e. percentages."""

    weights = np.array(weights, dtype=np.float64)
    sum_of_weights = weights.sum()
    # standardization:
    np.multiply(weights, 1 / sum_of_weights, weights)
    weights = weights.cumsum()
    x = random()
    for i in range(len(weights)):
        if x < weights[i]:
            return objects[i]

def sample_next_word_after_sequence(word_sequence, alpha = 0):
    print(k_words_idx_dict)
    next_words_key = k_words_idx_dict[word_sequence]
    next_word_vector = next_after_k_words_matrix[next_words_key] + alpha
    likelihoods = next_word_vector/next_word_vector.sum()
    
    return weighted_choice(distinct_words, likelihoods.toarray())
    
def stochastic_chain(seed, chain_length=15, seed_length=2):
    current_words = seed.split(' ')
    if len(current_words) != seed_length:
        raise ValueError(f'wrong number of words, expected {seed_length}')
    sentence = seed

    for _ in range(chain_length):
        sentence+=' '
        next_word = sample_next_word_after_sequence(' '.join(current_words))
        sentence+=next_word
        current_words = current_words[1:]+[next_word]
    return sentence
# example use    
print(stochastic_chain(choice(distinct_words), 
                        chain_length=int(random()*10)+10,
                        seed_length=1))
